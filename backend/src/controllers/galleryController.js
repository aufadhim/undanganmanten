import { prisma } from '../lib/prisma.js';
import { uploadToR2 } from '../lib/storage.js';
import { reorderGallerySchema } from '../utils/validators.js';

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

// GET /api/invitations/me/gallery
export async function listGallery(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const media = await prisma.galleryMedia.findMany({
      where: { invitationId: invitation.id },
      orderBy: { order: 'asc' },
    });

    return res.json({ media });
  } catch (err) {
    console.error('Error listGallery:', err);
    return res.status(500).json({ error: 'Gagal mengambil galeri media.' });
  }
}

// POST /api/invitations/me/gallery
export async function uploadGalleryMedia(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan.' });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const count = await prisma.galleryMedia.count({ where: { invitationId: invitation.id } });

    let maxLimit = 10; // TRIAL
    if (invitation.packageType === 'STANDARD' || invitation.packageType === 'PRO') maxLimit = 15;
    if (invitation.packageType === 'PREMIUM') maxLimit = 30;

    if (count >= maxLimit) {
      return res.status(403).json({
        error: `Batas maksimum galeri untuk paket Anda tercapai (${maxLimit} media). Upgrade untuk menambah kuota.`,
      });
    }

    const type = req.file.mimetype.startsWith('video') ? 'video' : 'photo';
    let url = '';

    // Hybrid Storage Handler: Jika ada buffer -> R2, Jika tersimpan di disk -> /uploads
    if (req.file.buffer) {
      url = await uploadToR2({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        folder: `invitations/${invitation.id}/gallery`,
        originalName: req.file.originalname,
      });
    } else {
      const fileName = req.file.filename || req.file.originalname;
      url = `/uploads/${fileName}`;
    }

    const media = await prisma.galleryMedia.create({
      data: {
        invitationId: invitation.id,
        type,
        url,
        order: count,
        layoutType: req.body.layoutType || 'grid',
      },
    });

    return res.status(201).json({ message: 'Media berhasil diunggah.', media });
  } catch (err) {
    console.error('Error uploadGalleryMedia:', err);
    return res.status(500).json({ error: err.message || 'Gagal mengunggah media galeri.' });
  }
}

// DELETE /api/invitations/me/gallery/:mediaId
export async function deleteGalleryMedia(req, res) {
  try {
    const { mediaId } = req.params;
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const media = await prisma.galleryMedia.findFirst({
      where: { id: mediaId, invitationId: invitation.id },
    });

    if (!media) return res.status(404).json({ error: 'Media tidak ditemukan.' });

    await prisma.galleryMedia.delete({ where: { id: mediaId } });
    return res.json({ message: 'Media berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleteGalleryMedia:', err);
    return res.status(500).json({ error: 'Gagal menghapus media galeri.' });
  }
}

// PATCH /api/invitations/me/gallery/reorder
export async function reorderGallery(req, res) {
  try {
    const parsed = reorderGallerySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.galleryMedia.updateMany({
          where: { id: item.id, invitationId: invitation.id },
          data: { order: item.order },
        })
      )
    );

    return res.json({ message: 'Urutan galeri berhasil disimpan.' });
  } catch (err) {
    console.error('Error reorderGallery:', err);
    return res.status(500).json({ error: 'Gagal menyimpan urutan galeri.' });
  }
}

// POST /api/invitations/me/gallery/link
export async function addGalleryLink(req, res) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL link tidak valid.' });
    }

    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const count = await prisma.galleryMedia.count({ where: { invitationId: invitation.id } });

    let maxLimit = 10; // TRIAL
    if (invitation.packageType === 'STANDARD' || invitation.packageType === 'PRO') maxLimit = 15;
    if (invitation.packageType === 'PREMIUM') maxLimit = 30;

    if (count >= maxLimit) {
      return res.status(403).json({
        error: `Batas maksimum galeri untuk paket Anda tercapai (${maxLimit} media). Upgrade untuk menambah kuota.`,
      });
    }

    // Selalu simpan dengan type video karena ini link eksternal (YouTube/TikTok/dll)
    const media = await prisma.galleryMedia.create({
      data: {
        invitationId: invitation.id,
        type: 'video',
        url: url,
        order: count,
        layoutType: 'grid',
      },
    });

    return res.status(201).json({ message: 'Link berhasil ditambahkan ke galeri.', media });
  } catch (err) {
    console.error('Error addGalleryLink:', err);
    return res.status(500).json({ error: 'Gagal menambahkan link galeri.' });
  }
}