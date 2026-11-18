import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

const BOT_USER_AGENTS = [
  'whatsapp',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'telegrambot',
  'discordbot',
  'linkedinbot',
  'slackbot',
  'googlebot',
  'pinterest',
];

export function isSocialBot(userAgent = '') {
  const ua = String(userAgent).toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function handleSlugOrBot(req, res, next) {
  const { slug } = req.params;
  const reservedSlugs = [
    'login', 'signup', 'forgot-password', 'reset-password',
    'dashboard', 'sandbox', 'admin', 'terms', 'privacy',
    'guide', 'tema', 'api', 'i', 'og', 'uploads', 'health', 'ready', 'depth-lab'
  ];

  if (reservedSlugs.includes(slug)) {
    return next();
  }

  const userAgent = req.headers['user-agent'] || '';
  const isBot = isSocialBot(userAgent) || req.query.bot === '1';

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      include: {
        coupleProfile: true,
        themeSettings: true,
        events: true,
      },
    });

    if (!invitation) {
      if (isBot) {
        return res.status(404).send('<!doctype html><html><head><title>Undangan Tidak Ditemukan</title></head><body>Undangan tidak ditemukan.</body></html>');
      }
      return res.redirect(302, `${env.frontendUrl}/${encodeURIComponent(slug)}`);
    }

    const profile = invitation.coupleProfile || {};
    const bride = profile.brideName || 'Bride';
    const groom = profile.groomName || 'Groom';
    const coupleTitle = `${escapeHtml(bride)} & ${escapeHtml(groom)}`;

    let formattedDate = '';
    if (invitation.weddingDate) {
      try {
        formattedDate = new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date(invitation.weddingDate));
      } catch {
        formattedDate = '';
      }
    }

    const theme = invitation.themeSettings || {};
    const coverImage =
      theme.coverImageUrl ||
      profile.bridePhoto ||
      profile.groomPhoto ||
      `${env.frontendUrl}/favicon.png`;

    const fullUrl = `${env.frontendUrl}/${encodeURIComponent(slug)}`;
    const pageTitle = `Undangan Pernikahan: ${coupleTitle}`;
    const pageDesc = formattedDate
      ? `Undangan Pernikahan ${coupleTitle} — ${escapeHtml(formattedDate)}. Buka tautan untuk informasi acara dan konfirmasi kehadiran.`
      : `Undangan Pernikahan ${coupleTitle}. Buka tautan untuk informasi acara dan konfirmasi kehadiran.`;

    if (isBot) {
      const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(fullUrl)}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:image" content="${escapeHtml(coverImage)}">
  <meta property="og:site_name" content="Samavaya">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(fullUrl)}">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDesc}">
  <meta name="twitter:image" content="${escapeHtml(coverImage)}">
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; background: #faf3e3; color: #182420;">
  <h1>${coupleTitle}</h1>
  <p>${pageDesc}</p>
  <p><a href="${escapeHtml(fullUrl)}" style="display: inline-block; background: #7a2436; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Buka Undangan</a></p>
</body>
</html>`;
      return res.status(200).type('html').send(html);
    }

    // Jika diakses oleh user browser biasa via domain backend, redirect mulus ke frontend
    return res.redirect(302, fullUrl);
  } catch (err) {
    console.error('Error handling OpenGraph bot slug:', err);
    return next();
  }
}
