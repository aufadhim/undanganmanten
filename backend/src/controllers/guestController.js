import { prisma } from '../lib/prisma.js';
import { bulkGuestSchema, guestSchema } from '../utils/validators.js';
import { getEntitlements } from '../utils/entitlements.js';

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

// GET /api/invitations/me/guests
export async function listGuests(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      include: { rsvp: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ guests });
  } catch (err) {
    console.error('Error listGuests:', err);
    return res.status(500).json({ error: 'Gagal mengambil daftar tamu.' });
  }
}

export const getGuests = listGuests;

// POST /api/invitations/me/guests
export async function addGuest(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const parsed = guestSchema.safeParse({ ...req.body, groupName: req.body.groupName || req.body.category });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, phone, groupName, paxLimit } = parsed.data;
    const [{ maxGuests }, currentCount] = await Promise.all([
      getEntitlements(invitation),
      prisma.guest.count({ where: { invitationId: invitation.id } }),
    ]);
    if (maxGuests !== null && currentCount >= maxGuests) {
      return res.status(403).json({ error: `Kuota tamu paket Anda sudah penuh (${maxGuests} tamu).` });
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        groupName: groupName || 'Umum',
        paxLimit,
      },
    });

    return res.status(201).json({ message: 'Tamu berhasil ditambahkan.', guest });
  } catch (err) {
    console.error('Error addGuest:', err);
    return res.status(500).json({ error: err.message || 'Gagal menambahkan tamu.' });
  }
}

// POST /api/invitations/me/guests/bulk
export async function bulkAddGuests(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const parsed = bulkGuestSchema.safeParse({ guests: (req.body?.guests || []).map((guest) => ({ ...guest, groupName: guest.groupName || guest.category })) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const existingGuests = await prisma.guest.findMany({ where: { invitationId: invitation.id, phone: { not: null } }, select: { phone: true } });
    const existingPhones = new Set(existingGuests.map((g) => (g.phone || '').replace(/\D/g, '')).filter(Boolean));
    const batchPhones = new Set();
    const guestsList = parsed.data.guests.filter((guest) => {
      const phone = (guest.phone || '').replace(/\D/g, '');
      if (!phone) return true;
      if (existingPhones.has(phone) || batchPhones.has(phone)) return false;
      batchPhones.add(phone);
      return true;
    });
    const skipped = parsed.data.guests.length - guestsList.length;
    if (!guestsList.length) return res.status(409).json({ error: 'Semua baris terdeteksi sebagai duplikat nomor WhatsApp.' });
    const [{ maxGuests }, currentCount] = await Promise.all([
      getEntitlements(invitation),
      prisma.guest.count({ where: { invitationId: invitation.id } }),
    ]);
    if (maxGuests !== null && currentCount + guestsList.length > maxGuests) {
      return res.status(403).json({ error: `Impor melebihi kuota paket. Tersedia ${Math.max(0, maxGuests - currentCount)} slot tamu.` });
    }

    const guestsData = guestsList.map((g) => ({
      name: g.name ? g.name.trim() : 'Tamu',
      phone: g.phone || null,
      groupName: g.groupName || 'Umum',
      paxLimit: g.paxLimit,
      invitationId: invitation.id,
    }));

    const result = await prisma.guest.createMany({
      data: guestsData,
    });

    return res.status(201).json({ message: `${result.count} tamu berhasil ditambahkan${skipped ? `, ${skipped} duplikat dilewati` : ''}.`, imported: result.count, skipped });
  } catch (err) {
    console.error('Error bulkAddGuests:', err);
    return res.status(500).json({ error: 'Gagal menambahkan banyak tamu.' });
  }
}

// PATCH /api/invitations/me/guests/:id (atau :guestId)
export async function updateGuest(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const guestId = req.params.guestId || req.params.id;
    const { name, phone, category, groupName, paxLimit } = req.body;

    await prisma.guest.updateMany({
      where: { id: guestId, invitationId: invitation.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(category || groupName ? { groupName: category || groupName } : {}),
        ...(paxLimit !== undefined ? { paxLimit: Math.min(2, Math.max(1, Number(paxLimit) || 1)) } : {}),
      },
    });

    return res.json({ message: 'Data tamu berhasil diperbarui.' });
  } catch (err) {
    console.error('Error updateGuest:', err);
    return res.status(500).json({ error: 'Gagal memperbarui data tamu.' });
  }
}

// DELETE /api/invitations/me/guests/:id atau :guestId
export async function deleteGuest(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const guestId = req.params.guestId || req.params.id;
    await prisma.guest.deleteMany({
      where: { id: guestId, invitationId: invitation.id },
    });

    return res.json({ message: 'Tamu berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleteGuest:', err);
    return res.status(500).json({ error: 'Gagal menghapus tamu.' });
  }
}

// POST /api/invitations/me/guests/:id/checkin
export async function checkInGuest(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const guestId = req.params.guestId || req.params.id;
    
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitationId: invitation.id }
    });

    if (!guest) return res.status(404).json({ error: 'Tamu tidak ditemukan.' });

    if (guest.checkedIn) {
      return res.status(409).json({
        error: `Tamu sudah check-in pada ${guest.checkedInAt?.toLocaleString('id-ID') || 'sebelumnya'}.`,
        guest,
      });
    }

    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      }
    });

    return res.json({ message: 'Berhasil Check-in tamu.', guest: { ...guest, checkedIn: true } });
  } catch (err) {
    console.error('Error checkInGuest:', err);
    return res.status(500).json({ error: 'Gagal melakukan Check-in.' });
  }
}

export async function undoCheckInGuest(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });
    const guest = await prisma.guest.findFirst({ where: { id: req.params.guestId, invitationId: invitation.id } });
    if (!guest) return res.status(404).json({ error: 'Tamu tidak ditemukan.' });
    const updated = await prisma.guest.update({ where: { id: guest.id }, data: { checkedIn: false, checkedInAt: null } });
    return res.json({ message: 'Check-in tamu dibatalkan.', guest: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Gagal membatalkan check-in.' });
  }
}

// POST /api/invitations/me/guests/blast
export async function blastInvitation(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const { guestIds } = req.body || {};
    const where = { invitationId: invitation.id, ...(guestIds ? { id: { in: guestIds } } : {}) };
    const guests = await prisma.guest.findMany({ where });

    const guestIdsToUpdate = guests.map((g) => g.id);
    if (guestIdsToUpdate.length > 0) {
      try {
        await prisma.guest.updateMany({
          where: { id: { in: guestIdsToUpdate } },
          data: { inviteStatus: 'sent', sentAt: new Date() },
        });
      } catch (schemaErr) {
        // Fallback jika kolom inviteStatus/sentAt belum ada di skema DB
        console.warn('Field inviteStatus/sentAt tidak ditemukan di skema Guest, lewati update.');
      }
    }

    return res.json({
      message: `${guests.length} undangan ditandai telah dibuka di WhatsApp.`,
      guestCount: guests.length,
    });
  } catch (err) {
    console.error('Error blastInvitation:', err);
    return res.status(500).json({ error: 'Gagal memproses blast.' });
  }
}

export const blastGuests = blastInvitation;

// GET /api/invitations/me/guests/export
export async function exportGuests(req, res) {
  try {
    const invitation = await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      include: { rsvp: true },
      orderBy: { name: 'asc' },
    });

    // CSV Header & Rows dengan Safely Quote Escaping
    const csvRows = ['"Nama","Nomor HP","Kategori","Status Undangan"'];
    for (const g of guests) {
      const cleanName = (g.name || '').replace(/"/g, '""');
      const cleanPhone = (g.phone || '-').replace(/"/g, '""');
      const cleanGroup = (g.groupName || 'Umum').replace(/"/g, '""');
      const cleanStatus = (g.inviteStatus || '-').replace(/"/g, '""');

      csvRows.push(`"${cleanName}","${cleanPhone}","${cleanGroup}","${cleanStatus}"`);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="data-tamu-${invitation.slug || 'undangan'}.csv"`);
    return res.send(csvRows.join('\n'));
  } catch (err) {
    console.error('Error exportGuests:', err);
    return res.status(500).json({ error: 'Gagal mengunduh CSV.' });
  }
}
