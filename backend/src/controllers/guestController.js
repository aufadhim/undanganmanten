import { randomUUID } from 'node:crypto';
import {guestReportCsv} from '../utils/guestReport.js';
import {guestScope} from '../utils/weddingGuests.js';
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
      where: { ...guestScope(invitation) },
      include: { rsvp: true, browserAccess: { where: { invitationId: invitation.id }, select: { linkToken: true, browserHash: true } } },
      orderBy: { name: 'asc' },
    });

    return res.json({
      guests: guests.map(({ browserAccess: [access], ...guest }) => ({
        ...guest, linkToken: access?.linkToken || guest.id, browserActive: Boolean(access?.browserHash),
      })),
      browserLock: invitation.browserLock,
      entitlements: await getEntitlements(invitation),
    });
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
      prisma.guest.count({ where: { ...guestScope(invitation) } }),
    ]);
    if (maxGuests !== null && currentCount >= maxGuests) {
      return res.status(403).json({ error: `Kuota tamu paket Anda sudah penuh (${maxGuests} tamu).` });
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId: invitation.id, weddingId:invitation.weddingId,
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
    const existingGuests = await prisma.guest.findMany({ where: { ...guestScope(invitation), phone: { not: null } }, select: { phone: true } });
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
      prisma.guest.count({ where: { ...guestScope(invitation) } }),
    ]);
    if (maxGuests !== null && currentCount + guestsList.length > maxGuests) {
      return res.status(403).json({ error: `Impor melebihi kuota paket. Tersedia ${Math.max(0, maxGuests - currentCount)} slot tamu.` });
    }

    const guestsData = guestsList.map((g) => ({
      name: g.name ? g.name.trim() : 'Tamu',
      phone: g.phone || null,
      groupName: g.groupName || 'Umum',
      paxLimit: g.paxLimit,
      invitationId:invitation.id,weddingId:invitation.weddingId,
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
      where: { id: guestId, ...guestScope(invitation) },
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
      where: { id: guestId, ...guestScope(invitation) },
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
    const invitation = req.deskInvitation || await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });

    const permissions=req.deskInvitation ? { qrGuestbook: true } : await getEntitlements(invitation);
    if(!permissions.qrGuestbook)return res.status(403).json({error:'Buku tamu QR belum diaktifkan. Aktifkan add-on melalui Paket & Pembayaran.'});
    const guestId = req.params.guestId || req.params.id;
    
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, ...guestScope(invitation) }
    });

    if (!guest) return res.status(404).json({ error: 'Tamu tidak ditemukan.' });

    if (guest.checkedIn) {
      return res.status(409).json({
        error: `Tamu sudah check-in pada ${guest.checkedInAt?.toLocaleString('id-ID') || 'sebelumnya'}.`,
        guest,
      });
    }

    const count=req.body.count??1;
    if(!Number.isInteger(count)||count<1||count>guest.paxLimit)return res.status(400).json({error:`Jumlah hadir harus 1–${guest.paxLimit} orang.`});
    const checkedInAt = new Date();
    const actor = req.deskAccessId ? 'guestdesk:' + req.deskAccessId : req.userId;
    // Commit attendance and its audit record in one database round trip.
    const [updated] = await prisma.$queryRaw`
      WITH recorded AS (
        UPDATE guests
        SET checked_in = true, checked_in_at = ${checkedInAt}, check_in_count = ${count}::int
        WHERE id = ${guest.id} AND checked_in = false AND pax_limit >= ${count}::int
          AND (
            (${invitation.weddingId}::text IS NOT NULL AND wedding_id = ${invitation.weddingId})
            OR (wedding_id IS NULL AND invitation_id = ${invitation.id})
            OR (${invitation.weddingId}::text IS NULL AND invitation_id = ${invitation.id})
          )
        RETURNING id
      ), audit AS (
        INSERT INTO admin_audit_logs (id, actor_id, action, target_type, target_id, reason, "after")
        SELECT ${randomUUID()}, ${actor}, 'guest.checkin', 'guest', id,
          'Konfirmasi kedatangan oleh penerima tamu.',
          jsonb_build_object('invitationId', ${invitation.id}::text, 'count', ${count}::int)
        FROM recorded
      )
      SELECT id FROM recorded
    `;
    if (!updated) return res.status(409).json({ error: 'Tamu sudah check-in atau data tamu berubah. Perbarui daftar sebelum mencoba lagi.' });

    return res.json({
      message: 'Berhasil Check-in tamu.',
      guest: { ...guest, checkedIn: true, checkedInAt, checkInCount: count },
    });
  } catch (err) {
    console.error('Error checkInGuest:', err);
    return res.status(500).json({ error: 'Gagal melakukan Check-in.' });
  }
}

export async function undoCheckInGuest(req, res) {
  try {
    const invitation = req.deskInvitation || await getInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'Kamu belum punya undangan.' });
    const guest = await prisma.guest.findFirst({ where: { id: req.params.guestId, ...guestScope(invitation) } });
    if (!guest) return res.status(404).json({ error: 'Tamu tidak ditemukan.' });
    const permissions=req.deskInvitation ? { qrGuestbook: true } : await getEntitlements(invitation);
    if(!permissions.qrGuestbook)return res.status(403).json({error:'Buku tamu QR belum aktif.'});
    const updated=await prisma.$transaction(async tx=>{
      const change=await tx.guest.updateMany({where:{id:guest.id,checkedIn:true},data:{checkedIn:false,checkedInAt:null,checkInCount:null}});
      if(change.count)await tx.adminAuditLog.create({data:{actorId:req.deskAccessId?`guestdesk:${req.deskAccessId}`:req.userId,action:'guest.checkin.undo',targetType:'guest',targetId:guest.id,reason:'Pembatalan check-in oleh penerima tamu.',before:{count:guest.checkInCount},after:{invitationId:invitation.id}}});
      return { ...guest, checkedIn: false, checkedInAt: null, checkInCount: null };
    });
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
    const where = { ...guestScope(invitation), ...(guestIds ? { id: { in: guestIds } } : {}) };
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
      where: { ...guestScope(invitation) },
      include: { rsvp: true },
      orderBy: { name: 'asc' },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="data-tamu-${invitation.slug || 'undangan'}.csv"`);
    return res.send(guestReportCsv(guests));
  } catch (err) {
    console.error('Error exportGuests:', err);
    return res.status(500).json({ error: 'Gagal mengunduh CSV.' });
  }
}

export async function updateBrowserLock(req, res, next) {
  try {
    if (typeof req.body?.enabled !== 'boolean') return res.status(400).json({ error: 'Pengaturan akses tidak valid.' });
    const invitation = await getInvitation(req);
    if (!invitation) return res.sendStatus(404);
    await prisma.invitation.update({ where: { id: invitation.id }, data: { browserLock: req.body.enabled } });
    return res.json({ browserLock: req.body.enabled });
  } catch (error) {
    return next(error);
  }
}

export async function changeGuestBrowserAccess(req, res, next) {
  try {
    const { action } = req.body || {};
    if (!['reset', 'rotate'].includes(action)) return res.status(400).json({ error: 'Tindakan akses tidak valid.' });
    const invitation = await getInvitation(req);
    if (!invitation) return res.sendStatus(404);
    const guest = await prisma.guest.findFirst({ where: { id: req.params.guestId, ...guestScope(invitation) } });
    if (!guest) return res.sendStatus(404);
    const where = { invitationId: invitation.id, guestId: guest.id };
    if (action === 'reset') {
      await prisma.guestBrowserAccess.updateMany({ where, data: { browserHash: null } });
    } else {
      const linkToken = randomUUID();
      await prisma.guestBrowserAccess.upsert({
        where: { invitationId_guestId: where },
        create: { ...where, linkToken },
        update: { linkToken, browserHash: null },
      });
    }
    return res.json({ updated: true });
  } catch (error) {
    return next(error);
  }
}