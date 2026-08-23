import { prisma } from '../lib/prisma.js';
import { upsertEventSchema } from '../utils/validators.js';

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

// Create atau update event berdasarkan type (akad/resepsi)
export async function upsertEvent(req, res) {
    try {
        const parsed = upsertEventSchema.safeParse(req.body);
        if (!parsed.success) {
            console.error('Validation error in upsertEvent:', parsed.error.issues);
            return res.status(400).json({ error: parsed.error.issues[0].message || 'Validasi gagal' });
        }

        const invitation = await getInvitation(req);
        if (!invitation) {
            return res.status(404).json({ error: 'Kamu belum punya undangan.' });
        }

        const { type, ...data } = parsed.data;

        const existingEvent = await prisma.event.findFirst({
            where: { invitationId: invitation.id, type },
        });

        let event;
        if (existingEvent) {
            event = await prisma.event.update({
                where: { id: existingEvent.id },
                data,
            });
        } else {
            event = await prisma.event.create({
                data: {
                    ...data,
                    type,
                    invitationId: invitation.id,
                },
            });
        }

        return res.json({ message: `Detail acara ${type} berhasil disimpan.`, event });
    } catch (err) {
        console.error('Error upsertEvent:', err);
        return res.status(500).json({ error: 'Gagal menyimpan detail acara.' });
    }
}

// Ambil daftar acara milik user
export async function listMyEvents(req, res) {
    try {
        const invitation = await getInvitation(req);
        if (!invitation) {
            return res.status(404).json({ error: 'Kamu belum punya undangan.' });
        }

        const events = await prisma.event.findMany({
            where: { invitationId: invitation.id },
            orderBy: { createdAt: 'asc' }, // Diurutkan agar posisi Akad & Resepsi konsisten
        });

        return res.json({ events });
    } catch (err) {
        console.error('Error listMyEvents:', err);
        return res.status(500).json({ error: 'Gagal mengambil daftar acara.' });
    }
}

// Hapus acara berdasarkan ID
export async function deleteEvent(req, res) {
    try {
        const { eventId } = req.params;

        const invitation = await getInvitation(req);
        if (!invitation) {
            return res.status(404).json({ error: 'Kamu belum punya undangan.' });
        }

        const event = await prisma.event.findFirst({
            where: { id: eventId, invitationId: invitation.id },
        });

        if (!event) {
            return res.status(404).json({ error: 'Acara tidak ditemukan.' });
        }

        await prisma.event.delete({ where: { id: eventId } });
        return res.json({ message: 'Acara berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleteEvent:', err);
        return res.status(500).json({ error: 'Gagal menghapus acara.' });
    }
}