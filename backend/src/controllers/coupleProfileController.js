import {persistThemeSettings} from '../services/persistThemeSettings.js';
import { prisma } from '../lib/prisma.js';
import { uploadToR2, scheduleOwnerAssetCleanup } from '../lib/storage.js';
import { updateCoupleProfileSchema, updateThemeSettingsSchema } from '../utils/validators.js';

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

        const parsed = updateCoupleProfileSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
        const { brideName, brideFullName, brideFather, brideMother, brideIg, brideBio, groomName, groomFullName, groomFather, groomMother, groomIg, groomBio } = parsed.data;

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


// One request, one transaction for profile text, character placement and bio visibility.
const profileThemeSchema=updateThemeSettingsSchema.pick({characterSettings:true,coverImageUrl:true,coverSecondImageUrl:true,brideBioEnabled:true,groomBioEnabled:true,brideInstagramEnabled:true,groomInstagramEnabled:true});
export async function saveProfileContent(req,res){
    const profile=updateCoupleProfileSchema.safeParse(req.body.profile);
    const theme=profileThemeSchema.safeParse(req.body.themeSettings||{});
    if(!profile.success||!theme.success)return res.status(400).json({error:(!profile.success?profile.error:theme.error).issues[0].message});
    const invitationId=req.headers?.['x-invitation-id']||req.body.invitationId;
    if(!invitationId)return res.status(400).json({error:'Pilih undangan terlebih dahulu.'});
    try{
        const result=await prisma.$transaction(async tx=>{
            const invitation=await tx.invitation.findFirst({where:{id:invitationId,userId:req.userId},include:{themeSettings:true}});
            if(!invitation)return null;
            const coupleProfile=await tx.coupleProfile.upsert({
                where:{invitationId:invitation.id},update:profile.data,
                create:{invitationId:invitation.id,brideName:'',groomName:'',...profile.data},
            });
            const saved=await persistThemeSettings(tx,invitation,theme.data);
            return {coupleProfile,...saved};
        },{timeout:15000});
        if(!result)return res.status(404).json({error:'Undangan tidak ditemukan.'});
        // Remote storage work must never run inside a transaction or before commit.
        if(result.releasedUrls.length)scheduleOwnerAssetCleanup(req.userId,{releasedUrls:result.releasedUrls});
        return res.json({message:'Profil dan ilustrasi berhasil disimpan.',coupleProfile:result.coupleProfile,themeSettings:result.themeSettings});
    }catch(error){
        console.error('Error saveProfileContent:',error);
        return res.status(500).json({error:'Profil dan ilustrasi belum tersimpan. Silakan coba lagi.'});
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
        const previousProfile=await prisma.coupleProfile.findUnique({where:{invitationId:invitation.id}});
        const photoUrl = await uploadToR2({
            ownerId: req.userId, invitationId: invitation.id,
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

        const field=side==='bride'?'bridePhoto':side==='logo'?'coupleLogoUrl':'groomPhoto';
        if(previousProfile?.[field]&&previousProfile[field]!==photoUrl)scheduleOwnerAssetCleanup(req.userId,{releasedUrls:[previousProfile[field]]});
        return res.json({ message: 'Foto berhasil diunggah.', coupleProfile: profile });
    } catch (err) {
        console.error('Error uploadCouplePhoto:', err);
        return res.status(err.status || 500).json({ error: err.message || 'Gagal mengunggah foto.' });
    }
}
