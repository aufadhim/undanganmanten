import {persistThemeSettings} from '../services/persistThemeSettings.js';
import {characterRenderAssets} from '../services/characterRenderAssets.js';
import {themeHidden} from '../utils/platformAccess.js';
import { prisma } from '../lib/prisma.js';
import { uploadToR2, scheduleOwnerAssetCleanup } from '../lib/storage.js';
import { updateThemeSettingsSchema, applyPresetSchema } from '../utils/validators.js';
import { THEME_PRESETS, getPresetById } from '../utils/themePresets.js';

// Helper mengambil data undangan aktif milik user
async function getInvitation(req) {
    const invitationId = req.headers?.['x-invitation-id'] || req.body?.invitationId || req.query?.invitationId || req.params?.id;

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

        const {themeSettings:updated,releasedUrls}=await persistThemeSettings(prisma,invitation,parsed.data);
        if(releasedUrls.length)scheduleOwnerAssetCleanup(req.userId,{releasedUrls});
        return res.json({ message: 'Warna tema berhasil diperbarui.', themeSettings: updated });
    } catch (err) {
        console.error('Error updateMyThemeSettings:', err);
        return res.status(500).json({ error: 'Gagal memperbarui pengaturan warna tema.' });
    }
}

// Apply a preset atomically; return only the changed invitation fields.
export async function applyThemePreset(req, res) {
    try {
        const parsed = applyPresetSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        const presetId = parsed.data.presetId;
        if(await themeHidden(presetId))return res.status(409).json({error:"Tema sedang tidak tersedia untuk desain baru."});
        const preset = getPresetById(presetId);

        if (!preset) {
            return res.status(400).json({ error: `Preset tema "${presetId}" tidak ditemukan.` });
        }

        const invitation = await getInvitation(req);
        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        const updatedInvitation = await prisma.$transaction(async (tx) => {
            // Update setting warna jika preset ditemukan
            if (preset?.settings) {
                await tx.themeSettings.upsert({
                    where: { invitationId: invitation.id },
                    update: preset.settings,
                    create: {
                        invitationId: invitation.id,
                        ...preset.settings,
                    },
                });
            }

            // Keep the response small; existing content stays in the editor state.
            return tx.invitation.update({
                where: { id: invitation.id },
                data: { themeId: presetId },
                select: { id:true, themeId:true, themeSettings:true },
            });
        });

        // Palette changes do not release uploaded media; no bucket scan is needed here.
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
        const hidden=await prisma.templateAvailability.findMany({where:{hidden:true}});
        return res.json({ themes: THEME_PRESETS.filter(p=>!hidden.some(h=>h.id===p.id)) });
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

        const directory = req.file.mimetype.startsWith('audio/') ? 'music' : req.body?.purpose === 'frame' ? 'frames' : 'artwork';
        let url = '';
        if (req.file.buffer) {
            url = await uploadToR2({
                ownerId: req.userId, invitationId: invitation.id,
                buffer: req.file.buffer,
                mimeType: req.file.mimetype,
                folder: `invitations/${invitation.id}/${directory}`,
                originalName: req.file.originalname,
            });
        } else {
            const fileName = req.file.filename || req.file.originalname;
            url = `/uploads/${fileName}`;
        }

        return res.status(201).json({ message: 'Asset berhasil diunggah.', url });
    } catch (err) {
        console.error('Error uploadAsset:', err);
        return res.status(err.status||500).json({ error: err.message||'Gagal mengunggah asset.' });
    }
}

export async function getCharacterRenderAssets(req,res){
 try{const invitation=await getInvitation(req);if(!invitation)return res.status(404).json({error:'Undangan tidak ditemukan.'});res.set('Cache-Control','private, no-store');const q=req.query;if(q.coverImageUrl!==undefined||q.coverSecondImageUrl!==undefined){for(const key of ['coverImageUrl','coverSecondImageUrl'])if(q[key]!==undefined&&(typeof q[key]!=='string'||q[key].length>2048))return res.status(400).json({error:'Gambar tidak valid.'});invitation.themeSettings={...invitation.themeSettings,...(q.coverImageUrl!==undefined?{coverImageUrl:q.coverImageUrl}:{}),...(q.coverSecondImageUrl!==undefined?{coverSecondImageUrl:q.coverSecondImageUrl}:{}),characterSettings:{mode:'custom',separatePose:q.separatePose==='true'}};}res.json({assets:await characterRenderAssets(invitation)})}
 catch(e){res.status(503).json({error:'Ilustrasi belum dapat dimuat dari penyimpanan. Coba muat ulang pratinjau.'})}
}
