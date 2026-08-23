import { prisma } from '../lib/prisma.js';
import { rsvpSchema, wishSchema, guestSchema } from '../utils/validators.js';

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

// Tamu submit RSVP dari halaman publik undangan (tanpa login)
export async function submitRsvp(req, res) {
  try {
    const { slug } = req.params;
    // Mendukung query parameter ?g= atau ?code=
    const guestIdParam = req.query.g || req.query.code;

    const guestPart = guestSchema.pick({ name: true, phone: true }).safeParse(req.body);
    const rsvpPart = rsvpSchema.safeParse(req.body);

    if (!guestPart.success) return res.status(400).json({ error: guestPart.error.issues[0].message });
    if (!rsvpPart.success) return res.status(400).json({ error: rsvpPart.error.issues[0].message });

    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      include: { invitationFeatures: true },
    });
    if (!invitation || invitation.status !== 'published') return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
    if (invitation.invitationFeatures && !invitation.invitationFeatures.rsvpEnabled) {
      return res.status(403).json({ error: 'RSVP tidak diaktifkan untuk undangan ini.' });
    }

    let guest = null;

    // Jika tamu mengakses via link unik
    if (guestIdParam) {
      guest = await prisma.guest.findFirst({
        where: { id: guestIdParam, invitationId: invitation.id },
      });
    }

    // Jika tidak punya link unik, cari berdasarkan nama
    if (!guest && guestPart.data.name) {
      guest = await prisma.guest.findFirst({
        where: { invitationId: invitation.id, name: guestPart.data.name.trim() },
      });
    }

    // Buat tamu baru jika belum terdaftar
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          invitationId: invitation.id,
          name: guestPart.data.name.trim(),
          phone: guestPart.data.phone || null,
        },
      });
    }

    const rsvp = await prisma.rsvpResponse.upsert({
      where: { guestId: guest.id },
      update: rsvpPart.data,
      create: { ...rsvpPart.data, guestId: guest.id },
    });

    return res.status(201).json({ message: 'Terima kasih sudah konfirmasi kehadiran.', rsvp });
  } catch (err) {
    console.error('Error submitRsvp:', err);
    return res.status(500).json({ error: 'Gagal menyimpan konfirmasi kehadiran.' });
  }
}

// Tamu kirim ucapan dari halaman publik undangan (tanpa login)
export async function submitWish(req, res) {
  try {
    const { slug } = req.params;

    const parsed = wishSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const invitation = await prisma.invitation.findUnique({ where: { slug } });
    if (!invitation || invitation.status !== 'published') return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

    // Profanity Filter dengan Word Boundaries agar tidak false positive
    const badWords = ['anjing', 'babi', 'bangsat', 'kontol', 'memek', 'asu', 'ngentot', 'perek', 'lonte', 'bajingan'];
    const messageLower = (parsed.data.message || '').toLowerCase();

    for (const word of badWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(messageLower)) {
        return res.status(400).json({ error: 'Ucapan mengandung kata-kata yang tidak pantas.' });
      }
    }

    let validGuestId = req.query.g || null;
    let wish;
    
    if (validGuestId) {
      const guestExists = await prisma.guest.findFirst({ where: { id: validGuestId, invitationId: invitation.id } });
      if (!guestExists) {
        validGuestId = null;
      }
    }

    if (validGuestId) {
      const existingWish = await prisma.wish.findFirst({
        where: { guestId: validGuestId, invitationId: invitation.id }
      });
      
      if (existingWish) {
        wish = await prisma.wish.update({
          where: { id: existingWish.id },
          data: { ...parsed.data, guestId: validGuestId }
        });
      } else {
        wish = await prisma.wish.create({
          data: { ...parsed.data, invitationId: invitation.id, guestId: validGuestId },
        });
      }
    } else {
      wish = await prisma.wish.create({
        data: { ...parsed.data, invitationId: invitation.id },
      });
    }

    return res.status(201).json({ message: 'Ucapan berhasil dikirim.', wish });
  } catch (err) {
    console.error('Error submitWish:', err);
    return res.status(500).json({ error: 'Gagal mengirim ucapan.' });
  }
}

// Dashboard: lihat rekap RSVP milik user sendiri
export async function getMyRsvpSummary(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      include: { rsvp: true },
    });

    const attending = guests.filter((g) => g.rsvp?.attending).length;
    const notAttending = guests.filter((g) => g.rsvp && !g.rsvp.attending).length;
    const noResponse = guests.filter((g) => !g.rsvp).length;

    return res.json({ summary: { attending, notAttending, noResponse, total: guests.length }, guests });
  } catch (err) {
    console.error('Error getMyRsvpSummary:', err);
    return res.status(500).json({ error: 'Gagal mengambil ringkasan RSVP.' });
  }
}

// Dashboard: hapus ucapan
export async function deleteWish(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const { wishId } = req.params;
    const wish = await prisma.wish.findFirst({ where: { id: wishId, invitationId: invitation.id } });
    if (!wish) return res.status(404).json({ error: 'Ucapan tidak ditemukan.' });

    await prisma.wish.delete({ where: { id: wishId } });
    return res.json({ message: 'Ucapan berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleteWish:', err);
    return res.status(500).json({ error: 'Gagal menghapus ucapan.' });
  }
}

// Dashboard: Balas ucapan tamu
export async function replyWish(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const { wishId } = req.params;
    const { reply } = req.body;
    if (!reply || !reply.trim()) return res.status(400).json({ error: 'Balasan tidak boleh kosong.' });

    const wish = await prisma.wish.findFirst({ where: { id: wishId, invitationId: invitation.id } });
    if (!wish) return res.status(404).json({ error: 'Ucapan tidak ditemukan.' });

    const updatedWish = await prisma.wish.update({
      where: { id: wishId },
      data: { reply: reply.trim() },
    });

    return res.json({ message: 'Balasan berhasil disimpan.', wish: updatedWish });
  } catch (err) {
    console.error('Error replyWish:', err);
    return res.status(500).json({ error: 'Gagal menyimpan balasan ucapan.' });
  }
}

// Dashboard: Toggle Pin/Hide ucapan tamu
export async function updateWish(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const { wishId } = req.params;
    const { isPinned, isHidden } = req.body;

    const wish = await prisma.wish.findFirst({ where: { id: wishId, invitationId: invitation.id } });
    if (!wish) return res.status(404).json({ error: 'Ucapan tidak ditemukan.' });

    const dataToUpdate = {};
    if (isPinned !== undefined) dataToUpdate.isPinned = isPinned;
    if (isHidden !== undefined) dataToUpdate.isHidden = isHidden;

    const updatedWish = await prisma.wish.update({
      where: { id: wishId },
      data: dataToUpdate,
    });

    return res.json({ message: 'Status ucapan berhasil diperbarui.', wish: updatedWish });
  } catch (err) {
    console.error('Error updateWish:', err);
    return res.status(500).json({ error: 'Gagal memperbarui status ucapan.' });
  }
}
