import plannerPublicRoutes from './routes/plannerPublicRoutes.js';
import { searchPages, searchPageHtml, sitemapXml, robotsTxt } from './utils/searchPages.js';
import guestDeskRoutes from './routes/guestDeskRoutes.js';
import weddingRoutes from './routes/weddingRoutes.js';
import {retryStorageCleanup} from './lib/storage.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

import authRoutes from './routes/authRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { runExpireJob } from './jobs/expireInvitations.js';
import { handleSlugOrBot, isSocialBot } from './controllers/openGraphController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (env.isProduction) app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  const startedAt = Date.now();
  res.on('finish', () => {
    if (env.isProduction || req.originalUrl === '/api/auth/google') {
      console.log(JSON.stringify({
        type: 'http', requestId, method: req.method,
        path: req.originalUrl.replace(/(\/(?:api\/)?planner\/(?:rundown|invite)\/)[^/?]+/g, '$1[redacted]'),
        status: res.statusCode, durationMs: Date.now() - startedAt,
      }));
    }
  });
  next();
});

// 1. OOTB Auto-create folder uploads jika belum eksis
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 2. Middlewares
app.use(cors({
  origin: env.isProduction ? env.frontendUrl : true,
  credentials: true,
}));
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '2mb', verify(req, _res, buffer) {
  if (req.path === '/api/payments/tripay/callback') req.tripayRawBody = buffer;
} }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

import adminRoutes from './routes/adminRoutes.js';

// Static Folder untuk serve file upload
app.use('/uploads', express.static(uploadsDir));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'undanganmanten-backend' });
});

app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ready', database: 'ok' });
  } catch {
    return res.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
});

// 3. Routes
app.use('/api/planner', plannerPublicRoutes);
app.use('/api/weddings', weddingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/guest-desk', guestDeskRoutes);
app.use('/api/admin', adminRoutes);

// Open Graph / Social Bot Handler (WhatsApp, FB, Telegram Preview)
app.get('/og/:slug', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex');
  return handleSlugOrBot(req, res, next);
});
const frontendDist = process.env.SERVE_FRONTEND === 'true'
  ? path.resolve(__dirname, '../../frontend/dist')
  : null;

if (frontendDist) {
  const indexFile = path.join(frontendDist, 'index.html');
  if (!fs.existsSync(indexFile)) throw new Error('Build frontend belum tersedia.');

  // Google Identity Services needs the SPA document to retain its sign-in popup.
  const allowGooglePopup = (res) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cache-Control', 'no-cache');
  };
  app.get('/robots.txt', (_req, res) => res.type('text/plain').send(robotsTxt));
  app.get('/sitemap.xml', (_req, res) => res.type('application/xml').send(sitemapXml));
  app.get(Object.keys(searchPages), (req, res) => {
    allowGooglePopup(res);
    const pathname = req.path === '/' ? '/' : req.path.replace(/\/$/, '').toLowerCase();
    res.type('html').send(searchPageHtml(fs.readFileSync(indexFile, 'utf8'), pathname));
  });
  app.use(express.static(frontendDist, {
    setHeaders(res, file) {
      if (file === indexFile) allowGooglePopup(res);
      const relative = path.relative(frontendDist, file).split(path.sep).join('/');
      if (relative.endsWith('.html')) res.setHeader('X-Robots-Tag', 'noindex');
      if (['sw.js', 'registerSW.js'].includes(relative) ||
          (relative.startsWith('templates/') && /\.(html|js|css|json|svg)$/i.test(relative))) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
      }
    },
  }));
  app.get('/:slug', (req, res, next) => {
    res.set('X-Robots-Tag', 'noindex');
    if (isSocialBot(req.get('user-agent')) || req.query.bot === '1') {
      return handleSlugOrBot(req, res, next);
    }
    next();
  });
  app.get('*', (req, res, next) => {
    if (/^\/(api|uploads|assets|templates|og)(\/|$)/.test(req.path) || !req.accepts('html')) return next();
    allowGooglePopup(res);
    if (/^\/planner\/(rundown|invite)\//.test(req.path)) {
      res.set('Referrer-Policy', 'no-referrer');
      res.set('Cache-Control', 'private, no-store');
    }
    res.set('X-Robots-Tag', 'noindex');
    res.sendFile(indexFile);
  });
} else {
  app.get('/:slug', handleSlugOrBot);
}

// 4. Global Error Handler (Penyelamat agar server tidak crash seketika jika ada error)
app.use((err, req, res, next) => {
  console.error('[server error]', err);

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Ukuran file melebihi batas yang diizinkan.' });
  }

  // Jika error karena database connection lost (biasa terjadi setelah laptop sleep)
  // Kita paksa exit process agar nodemon merestart ulang koneksi DB dengan bersih.
  const isDbError = err.message && (
      err.message.includes("Can't reach database server") || 
      err.message.includes("Connection to database server") ||
      err.message.includes("PrismaClientInitializationError") ||
      err.code === 'P1001'
  );

  if (isDbError) {
      console.log('🚨 Terdeteksi Database Connection Error (mungkin setelah Sleep). Force Restarting...');
      res.status(500).json({ error: 'Database reconnecting... silakan refresh dalam 2 detik.' });
      setTimeout(() => process.exit(1), 500); // Exit dengan error agar Nodemon men-trigger restart
      return;
  }

  const status = err.status || 500;
  const publicMessage = status < 500 || !env.isProduction
    ? (err.message || 'Internal Server Error')
    : 'Terjadi gangguan pada server. Silakan coba lagi.';
  res.status(status).json({ error: publicMessage, requestId: req.requestId });
});

// 5. Cron Job - Jalan tiap jam 02:00
cron.schedule('0 2 * * *', () => {
  console.log('[cron] Menjalankan expire job...');
  runExpireJob().catch((err) => console.error('[cron] Gagal:', err));
  retryStorageCleanup().catch(err=>console.error('[cron] Storage cleanup:',err.message));
});

const PORT = env.port;
const HOST = env.isProduction && !frontendDist ? '0.0.0.0' : '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
  console.log(`[server] ${env.nodeEnv} berjalan di ${env.backendUrl} (port ${PORT})`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[EADDRINUSE] Port ${PORT} sedang dipakai oleh proses lain. Mematikan otomatis...`);
    import('child_process').then(({ exec }) => {
      exec(`npx kill-port ${PORT}`, (error, stdout, stderr) => {
        console.log(`[Auto-Kill] Proses di port ${PORT} telah dihentikan. Mencoba lagi...`);
        setTimeout(() => {
          server.close();
          server.listen(PORT, HOST);
        }, 1000);
      });
    });
  } else {
    console.error('[server error]', err);
  }
});


// 6. Graceful Shutdown & Process Handlers
const handleShutdown = async (signal) => {
  console.log(`\n[server] Sinyal ${signal} diterima. Menutup server...`);
  
  // Tutup paksa semua koneksi aktif agar close() tidak menggantung
  if (server.closeAllConnections) {
      server.closeAllConnections();
  }

  try {
    await prisma.$disconnect();
    console.log('[server] Prisma disconnected successfully.');
  } catch (err) {
    console.error('[server] Failed to disconnect Prisma:', err);
  }

  server.close(() => {
    console.log('[server] Server berhasil ditutup & port dilepaskan.');
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  });

  // Paksa shutdown jika server.close masih menggantung > 3 detik
  setTimeout(() => {
    if (signal === 'SIGUSR2') process.kill(process.pid, 'SIGUSR2');
    else process.exit(0);
  }, 3000).unref();
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Tangkap sinyal khusus nodemon restart (menghindari EADDRINUSE)
process.once('SIGUSR2', () => handleShutdown('SIGUSR2'));

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  const msg = reason?.message || '';
  if (msg.includes("Can't reach database server") || msg.includes("PrismaClientInitializationError") || reason?.code === 'P1001') {
      console.log('🚨 Unhandled DB Connection Error. Force Restarting...');
      process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
