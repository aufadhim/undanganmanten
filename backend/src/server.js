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
    if (env.isProduction) {
      console.log(JSON.stringify({
        type: 'http', requestId, method: req.method, path: req.originalUrl,
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
app.use(express.json({ limit: '2mb' }));
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
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

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
});

const PORT = env.port;
const HOST = env.isProduction ? '0.0.0.0' : '127.0.0.1';

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
