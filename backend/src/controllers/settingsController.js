import { prisma } from '../lib/prisma.js';
import {
  giftSettingsSchema,
  livestreamSettingsSchema,
  invitationFeaturesSchema,
} from '../utils/validators.js';

// Helper mengambil data undangan aktif milik user
async function getInvitation(req) {
    const invitationId =
        (typeof req === 'object' && req !== null ? req.headers?.['x-invitation-id'] || req.query?.invitationId || req.body?.invitationId || req.params?.invitationId : null) ||
        (typeof req === 'string' ? req : null);

    return prisma.invitation.findFirst({
        where: {
            userId: typeof req === 'object' ? req.userId : req,
            ...(invitationId ? { id: invitationId } : {}),
        },
        orderBy: { createdAt: 'desc' },
    });
}

// PATCH /api/invitations/me/gift-settings
export async function upsertGiftSettings(req, res) {
  try {
    const parsed = giftSettingsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const features = await prisma.invitationFeatures.findUnique({ where: { invitationId: invitation.id } });
    // Fitur Hadiah/Amplop sekarang bisa diakses oleh semua tier (TRIAL, PRO, PREMIUM)

    const giftSettings = await prisma.giftSettings.upsert({
      where: { invitationId: invitation.id },
      update: parsed.data,
      create: { ...parsed.data, invitationId: invitation.id },
    });

    return res.json({ message: 'Info hadiah berhasil disimpan.', giftSettings });
  } catch (err) {
    console.error('Error upsertGiftSettings:', err);
    return res.status(500).json({ error: 'Gagal menyimpan pengaturan hadiah.' });
  }
}

// PATCH /api/invitations/me/livestream-settings
export async function upsertLivestreamSettings(req, res) {
  try {
    const parsed = livestreamSettingsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    // DIBYPASS UNTUK DEVELOPMENT
    /*
    if (invitation.packageType !== 'PREMIUM') {
      return res.status(403).json({
        error: 'Fitur Live Streaming hanya tersedia untuk paket PREMIUM. Silakan upgrade paket Anda.',
      });
    }
    */

    const livestreamSettings = await prisma.livestreamSettings.upsert({
      where: { invitationId: invitation.id },
      update: parsed.data,
      create: { ...parsed.data, invitationId: invitation.id },
    });

    return res.json({ message: 'Link live streaming berhasil disimpan.', livestreamSettings });
  } catch (err) {
    console.error('Error upsertLivestreamSettings:', err);
    return res.status(500).json({ error: 'Gagal menyimpan pengaturan live streaming.' });
  }
}

// PATCH /api/invitations/me/features (Toggle on/off fitur interaktif)
export async function updateInvitationFeatures(req, res) {
  try {
    const parsed = invitationFeaturesSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const { rsvpEnabled, giftEnabled, livestreamEnabled, timelineEnabled, storyEnabled, dresscodeEnabled, rundownEnabled, igFilterEnabled } = parsed.data;

    // Enforcement pembatasan paket (DIBYPASS UNTUK DEVELOPMENT)
    /*
    if (invitation.packageType === 'TRIAL') {
      // Di TRIAL: Hanya Gift (Amplop Digital) yang bebas. RSVP, Livestream, Timeline, Story dilarang.
      if (rsvpEnabled || livestreamEnabled || timelineEnabled || storyEnabled || rundownEnabled || dresscodeEnabled || igFilterEnabled) {
        return res.status(403).json({
          error: 'Paket TRIAL tidak mendukung fitur ini. Silakan upgrade ke paket LAMAR atau PENGANTIN.',
        });
      }
    } else if (invitation.packageType === 'PRO') {
      if (livestreamEnabled) {
        return res.status(403).json({
          error: 'Fitur Live Streaming hanya tersedia untuk paket PREMIUM.',
        });
      }
    }
    */

    // Menggunakan upsert agar otomatis terbuat jika record belum ada di DB
    const features = await prisma.invitationFeatures.upsert({
      where: { invitationId: invitation.id },
      update: parsed.data,
      create: {
        invitationId: invitation.id,
        ...parsed.data,
      },
    });

    return res.json({ message: 'Pengaturan fitur berhasil diperbarui.', features });
  } catch (err) {
    console.error('Error updateInvitationFeatures:', err);
    return res.status(500).json({ error: 'Gagal memperbarui fitur undangan.' });
  }
}