import { prisma } from '../lib/prisma.js';
import { uploadToR2 } from '../lib/storage.js';
import { updateThemeSettingsSchema, applyPresetSchema } from '../utils/validators.js';
import { THEME_PRESETS, getPresetById } from '../utils/themePresets.js';

// Helper mengambil data undangan aktif milik user
async function getInvitation(req) {
    const invitationId = req.body?.invitationId || req.query?.invitationId || req.params?.id;

    return prisma.invitation.findFirst({
        where: {
            userId: req.userId,
            ...(invitationId ? { id: invitationId } : {}),
        },
        include: { themeSettings: true },
        orderBy: { createdAt: 'desc' },
    });
}

// Update granular: memperbarui field tertentu tanpa menimpa field lain
export async function updateMyThemeSettings(req, res) {
    try {
        const parsed = updateThemeSettingsSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        const invitation = await getInvitation(req);
        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        const current = invitation.themeSettings || {};
        const patch = parsed.data;

        const merged = {
            background: { ...(current.background || {}), ...(patch.background || {}) },
            bodyText: { ...(current.bodyText || {}), ...(patch.bodyText || {}) },
            button: { ...(current.button || {}), ...(patch.button || {}) },
            typography: { ...(current.typography || {}), ...(patch.typography || {}) },
            ...(patch.musicUrl !== undefined && { musicUrl: patch.musicUrl }),
            ...(patch.animationType !== undefined && { animationType: patch.animationType }),
            ...(patch.customLogoUrl !== undefined && { customLogoUrl: patch.customLogoUrl }),
            ...(patch.waTemplate !== undefined && { waTemplate: patch.waTemplate }),
            ...(patch.dresscodeText !== undefined && { dresscodeText: patch.dresscodeText }),
            ...(patch.dresscodeDetails !== undefined && { dresscodeDetails: patch.dresscodeDetails }),
            ...(patch.igFilterUrl !== undefined && { igFilterUrl: patch.igFilterUrl }),
            ...(patch.igFilterImageUrl !== undefined && { igFilterImageUrl: patch.igFilterImageUrl }),
            ...(patch.coverType !== undefined && { coverType: patch.coverType }),
            ...(patch.coverImageUrl !== undefined && { coverImageUrl: patch.coverImageUrl }),
            ...(patch.coverSecondImageUrl !== undefined && { coverSecondImageUrl: patch.coverSecondImageUrl }),
            ...(patch.openingAnimation !== undefined && { openingAnimation: patch.openingAnimation }),
            ...(patch.layoutOrder !== undefined && { layoutOrder: patch.layoutOrder }),
            ...(patch.mainStory !== undefined && { mainStory: patch.mainStory }),
        };

        // Gunakan upsert agar jika record themeSettings belum ada, sistem otomatis membuatnya
        const updated = await prisma.themeSettings.upsert({
            where: { invitationId: invitation.id },
            update: merged,
            create: {
                invitationId: invitation.id,
                ...merged,
            },
        });

        return res.json({ message: 'Warna tema berhasil diperbarui.', themeSettings: updated });
    } catch (err) {
        console.error('Error updateMyThemeSettings:', err);
        return res.status(500).json({ error: 'Gagal memperbarui pengaturan warna tema.' });
    }
}

// Ganti seluruh tema sekaligus pakai salah satu preset & kembalikan data invitation utuh
export async function applyThemePreset(req, res) {
    try {
        const parsed = applyPresetSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        const presetId = parsed.data.presetId;
        const preset = getPresetById(presetId);

        if (!preset) {
            return res.status(400).json({ error: `Preset tema "${presetId}" tidak ditemukan.` });
        }

        const invitation = await getInvitation(req);
        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        // Update setting warna jika preset ditemukan
        if (preset?.settings) {
            await prisma.themeSettings.upsert({
                where: { invitationId: invitation.id },
                update: preset.settings,
                create: {
                    invitationId: invitation.id,
                    ...preset.settings,
                },
            });
        }

        // Update themeId dan ambil data undangan lengkap beserta relasinya
        const updatedInvitation = await prisma.invitation.update({
            where: { id: invitation.id },
            data: { themeId: presetId },
            include: {
                coupleProfile: true,
                themeSettings: true,
                invitationFeatures: true,
                events: true,
                galleryMedia: true,
                timelineStories: true,
                giftSettings: true,
                wishes: true,
                guests: true,
            },
        });

        return res.json({
            message: `Tema "${preset?.name || presetId}" berhasil diterapkan.`,
            invitation: updatedInvitation,
            themeSettings: updatedInvitation.themeSettings,
        });
    } catch (err) {
        console.error('Error applyThemePreset:', err);
        return res.status(500).json({ error: 'Gagal menerapkan preset tema.' });
    }
}

// Publik: daftar preset tema buat halaman pilih template (tanpa login)
export async function listThemePresets(req, res) {
    try {
        return res.json({ themes: THEME_PRESETS });
    } catch (err) {
        console.error('Error listThemePresets:', err);
        return res.status(500).json({ error: 'Gagal mengambil daftar tema.' });
    }
}

// POST /api/invitations/me/theme/upload-asset
export async function uploadAsset(req, res) {
    try {
        if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan.' });

        const invitation = await getInvitation(req);
        if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

        let url = '';
        if (req.file.buffer) {
            url = await uploadToR2({
                buffer: req.file.buffer,
                mimeType: req.file.mimetype,
                folder: `invitations/${invitation.id}/assets`,
                originalName: req.file.originalname,
            });
        } else {
            const fileName = req.file.filename || req.file.originalname;
            url = `/uploads/${fileName}`;
        }

        return res.status(201).json({ message: 'Asset berhasil diunggah.', url });
    } catch (err) {
        console.error('Error uploadAsset:', err);
        return res.status(500).json({ error: 'Gagal mengunggah asset.' });
    }
}