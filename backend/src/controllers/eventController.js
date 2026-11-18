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
            orderBy: { type: 'asc' },
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

export async function saveQuickDraft(req, res) {
    const { brideName, groomName, ...event } = req.body || {};
    const names = [brideName, groomName].map(name => typeof name === 'string' ? name.trim() : '');
    const parsed = upsertEventSchema.safeParse(event);
    if (names.some(name => !name || name.length > 100) || !parsed.success ||
        !parsed.data.date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(parsed.data.startTime || '') ||
        !parsed.data.venueName?.trim() || !parsed.data.address?.trim()) {
        return res.status(400).json({ error: 'Lengkapi nama pasangan, tanggal, jam, lokasi, dan alamat acara.' });
    }
    try {
        const invitation = await getInvitation(req);
        if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        const result = await prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${invitation.id} FOR UPDATE`;
            const current = await tx.invitation.findUnique({ where: { id: invitation.id } });
            if (current?.status !== 'draft' || current.packageType !== 'TRIAL' || current.suspendedAt) return null;

            const { type, date, startTime, venueName, address } = parsed.data;
            const profile = { brideName: names[0], groomName: names[1] };
            const coupleProfile = await tx.coupleProfile.upsert({
                where: { invitationId: current.id },
                update: profile,
                create: { invitationId: current.id, ...profile },
            });
            const details = { date, startTime, venueName: venueName.trim(), address: address.trim() };
            const existing = await tx.event.findFirst({ where: { invitationId: current.id, type } });
            if (existing) await tx.event.update({ where: { id: existing.id }, data: details });
            else await tx.event.create({ data: { ...details, type, invitationId: current.id } });
            await tx.invitation.update({ where: { id: current.id }, data: { weddingDate: date } });
            const events = await tx.event.findMany({ where: { invitationId: current.id } });
            return { id: current.id, weddingDate: date, coupleProfile, events };
        });
        if (!result) return res.status(409).json({ error: 'Gunakan Studio untuk mengedit undangan yang sudah aktif atau ditangguhkan.' });
        return res.json({ invitation: result });
    } catch (error) {
        console.error('Error saveQuickDraft:', error);
        return res.status(500).json({ error: 'Detail undangan belum tersimpan. Coba lagi.' });
    }
}

export async function replaceEvents(req, res) {
    const input = req.body?.events;
    if (!Array.isArray(input) || input.length < 1 || input.length > 2) {
        return res.status(400).json({ error: 'Pilih jenis acara yang tersedia.' });
    }
    const parsed = input.map(event => upsertEventSchema.safeParse(event));
    if (parsed.some(result => !result.success)) return res.status(400).json({ error: 'Periksa detail acara.' });
    const events = parsed.map(result => result.data);
    const types = events.map(event => event.type);
    if (types.length === 2 && !(types.includes('akad') && types.includes('resepsi'))) {
        return res.status(400).json({ error: 'Susunan acara tidak valid.' });
    }
    try {
        const invitation = await getInvitation(req);
        if (!invitation) return res.sendStatus(404);
        const primary = events.find(event => event.type === 'akad') || events[0];
        const saved = await prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${invitation.id} FOR UPDATE`;
            await tx.event.deleteMany({ where: { invitationId: invitation.id, type: { notIn: types } } });
            for (const event of events) {
                const existing = await tx.event.findFirst({ where: { invitationId: invitation.id, type: event.type } });
                if (existing) await tx.event.update({ where: { id: existing.id }, data: event });
                else await tx.event.create({ data: { ...event, invitationId: invitation.id } });
            }
            if (primary.date) await tx.invitation.update({ where: { id: invitation.id }, data: { weddingDate: primary.date } });
            return tx.event.findMany({ where: { invitationId: invitation.id }, orderBy: { type: 'asc' } });
        });
        return res.json({ events: saved, weddingDate: primary.date || invitation.weddingDate });
    } catch (error) {
        console.error('Error replaceEvents:', error);
        return res.status(500).json({ error: 'Rangkaian acara belum tersimpan.' });
    }
}
