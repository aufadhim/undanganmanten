import { prisma } from '../lib/prisma.js';

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

// PATCH /api/invitations/me/quote
export async function updateQuoteSettings(req, res) {
    try {
        const invitation = await getInvitation(req);
        if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

        const { enabled, religion, customText, customSource } = req.body;

        const updated = await prisma.quoteSettings.upsert({
            where: { invitationId: invitation.id },
            update: { enabled, religion, customText, customSource },
            create: {
                invitationId: invitation.id,
                enabled: enabled !== undefined ? enabled : false,
                religion: religion || 'islam',
                customText,
                customSource,
            }
        });

        res.json({ message: 'Pengaturan kutipan berhasil disimpan', quoteSettings: updated });
    } catch (err) {
        console.error('Error updateQuoteSettings:', err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
}
