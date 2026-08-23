import { prisma } from '../lib/prisma.js';
import { uploadToR2 } from '../lib/storage.js';

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

// PATCH /api/invitations/me/couple-profile
export async function updateCoupleProfile(req, res) {
    try {
        const invitation = await getInvitation(req);
        if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

        const { brideName, brideFullName, brideFather, brideMother, brideIg, brideBio, groomName, groomFullName, groomFather, groomMother, groomIg, groomBio } = req.body;

        const profile = await prisma.coupleProfile.upsert({
            where: { invitationId: invitation.id },
            update: {
                ...(brideName !== undefined ? { brideName } : {}),
                ...(brideFullName !== undefined ? { brideFullName } : {}),
                ...(brideFather !== undefined ? { brideFather } : {}),
                ...(brideMother !== undefined ? { brideMother } : {}),
                ...(brideIg !== undefined ? { brideIg } : {}),
                ...(brideBio !== undefined ? { brideBio } : {}),
                ...(groomName !== undefined ? { groomName } : {}),
                ...(groomFullName !== undefined ? { groomFullName } : {}),
                ...(groomFather !== undefined ? { groomFather } : {}),
                ...(groomMother !== undefined ? { groomMother } : {}),
                ...(groomIg !== undefined ? { groomIg } : {}),
                ...(groomBio !== undefined ? { groomBio } : {}),
            },
            create: {
                invitationId: invitation.id,
                brideName: brideName || '',
                brideFullName: brideFullName || '',
                brideFather: brideFather || '',
                brideMother: brideMother || '',
                brideIg: brideIg || '',
                brideBio: brideBio || '',
                groomName: groomName || '',
                groomFullName: groomFullName || '',
                groomFather: groomFather || '',
                groomMother: groomMother || '',
                groomIg: groomIg || '',
                groomBio: groomBio || '',
            },
        });

        return res.json({ message: 'Profil berhasil diperbarui.', coupleProfile: profile });
    } catch (err) {
        console.error('Error updateCoupleProfile:', err);
        return res.status(500).json({ error: 'Gagal memperbarui profil.' });
    }
}

// POST /api/invitations/me/couple-profile/photo
export async function uploadCouplePhoto(req, res) {
    try {
        const invitation = await getInvitation(req);
        if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

        if (!req.file) {
            return res.status(400).json({ error: 'File foto tidak ditemukan.' });
        }

        const side = req.query.side || req.query.type || req.body.side || req.body.type || 'groom';
        const isBride = side === 'bride';

        // Simpan buffer file ke disk/R2 via uploadToR2
        const photoUrl = await uploadToR2({
            buffer: req.file.buffer,
            mimeType: req.file.mimetype,
            folder: `invitations/${invitation.id}/profile`,
            originalName: req.file.originalname,
        });

        let updateData = {};
        if (side === 'bride') updateData = { bridePhoto: photoUrl };
        else if (side === 'logo') updateData = { coupleLogoUrl: photoUrl };
        else updateData = { groomPhoto: photoUrl };

        const profile = await prisma.coupleProfile.upsert({
            where: { invitationId: invitation.id },
            update: updateData,
            create: {
                invitationId: invitation.id,
                groomName: 'Mempelai Pria',
                brideName: 'Mempelai Wanita',
                groomFather: '',
                groomMother: '',
                brideFather: '',
                brideMother: '',
                ...updateData,
            },
        });

        return res.json({ message: 'Foto berhasil diunggah.', coupleProfile: profile });
    } catch (err) {
        console.error('Error uploadCouplePhoto:', err);
        return res.status(500).json({ error: err.message || 'Gagal mengunggah foto.' });
    }
}