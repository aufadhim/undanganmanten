import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { galleryPhotoKey, openGalleryPhoto, invitationMusicKey, openInvitationMusic } from '../lib/storage.js';
import {getEntitlements} from '../utils/entitlements.js';
import {characterRenderAssets} from '../services/characterRenderAssets.js';
import {isPublicBlocked,themeHidden} from '../utils/platformAccess.js';
import {guestScope,exposeWeddingGuests} from '../utils/weddingGuests.js';
import {indexLegacyAssets,cleanupOwnerAssets,storageUsage} from '../lib/storage.js';
import { prisma } from '../lib/prisma.js';
import { generateUniqueSlug } from '../utils/slug.js';
import { createInvitationSchema, updateInvitationSchema } from '../utils/validators.js';
import { publicationChecklist, lifecycleTransition, cloneContent } from '../utils/invitationLifecycle.js';
import { getPresetById } from '../utils/themePresets.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const RESERVED_SLUGS = ['planner', 'login', 'signup', 'forgot-password', 'reset-password', 'dashboard', 'sandbox', 'admin', 'terms', 'privacy', 'guide', 'tema', 'api', 'i', 'depth-lab'];

// Default warna tema netral
const DEFAULT_THEME_SETTINGS = {
    background: { primary: '#f7f7f2', secondary: '#e8e6df', tertiary: '#f0cdd4', enabled: true },
    bodyText: { primary: '#1f2a44', secondary: '#6b6b6b', tertiary: '#c0435a', enabled: true },
    button: { primary: '#1f3a5f', secondary: '#e5789a', enabled: true },
    typography: { fontHeading: 'Playfair Display', fontBody: 'Poppins' },
};

// 1. Buat Undangan Baru (Draft)
export async function createInvitation(req, res) {
    try {
        const parsed = createInvitationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        const { groomName, brideName, weddingDate, themeId, customSlug, weddingId } = parsed.data;
        if(themeId && await themeHidden(themeId))return res.status(409).json({error:"Tema sedang tidak tersedia untuk desain baru."});
        const initialThemeSettings = getPresetById(themeId)?.settings || DEFAULT_THEME_SETTINGS;

        const slug = customSlug
            ? customSlug.toLowerCase()
            : await generateUniqueSlug(`${brideName}-${groomName}`);

        if (RESERVED_SLUGS.includes(slug)) {
            return res.status(400).json({ error: 'Slug/URL ini adalah kata yang dicadangkan oleh sistem dan tidak dapat digunakan.' });
        }

        if (customSlug) {
            const slugTaken = await prisma.invitation.findUnique({ where: { slug: customSlug } });
            if (slugTaken) {
                return res.status(409).json({ error: 'Slug/URL sudah dipakai, coba yang lain.' });
            }
        }

        // Only paid packages enforce this date; trial drafts remain editable.
        const expiresAt = new Date(new Date(weddingDate).getTime() + THIRTY_DAYS_MS);

        const invitation = await prisma.$transaction(async tx => {
            const active=await tx.invitation.findMany({where:{userId:req.userId},select:{status:true,packageType:true}});
            if(active.length>=3)throw Object.assign(new Error('Maksimal 3 undangan per akun, termasuk arsip dan undangan berbayar. Hapus permanen undangan yang tidak digunakan untuk membuka slot.'),{quota:true});
            let wedding;
            if(weddingId){wedding=await tx.wedding.findFirst({where:{id:weddingId,userId:req.userId}});if(!wedding)throw Object.assign(new Error('Pernikahan tidak ditemukan.'),{status:404})}
            else{if(await tx.wedding.count({where:{userId:req.userId}})>=3)throw Object.assign(new Error('Maksimal 3 pernikahan per akun. Gunakan pernikahan yang sudah ada.'),{status:403});wedding=await tx.wedding.create({data:{userId:req.userId,title:`${brideName} & ${groomName}`,weddingDate}})}
            return tx.invitation.create({
            data: {
                userId: req.userId,
                weddingId:wedding.id,
                slug,
                themeId,
                weddingDate,
                expiresAt,
                status: 'draft',
                packageType: 'TRIAL',
                coupleProfile: {
                    create: { groomName, brideName },
                },
                themeSettings: {
                    create: initialThemeSettings,
                },
                invitationFeatures: {
                    create: {
                        rsvpEnabled: true,
                        giftEnabled: true,
                        livestreamEnabled: false,
                        timelineEnabled: true,
                        storyEnabled: false,
                        animationEnabled: true,
                        customLogoEnabled: true,
                        musicEnabled: true,
                        dresscodeEnabled: false,
                        igFilterEnabled: false,
                        rundownEnabled: false,
                    },
                },
            },
            include: {
                wedding: true,
                coupleProfile: true,
                quoteSettings: true,
                themeSettings: true,
                invitationFeatures: true,
                events: true,
                galleryMedia: true,
                timelineStories: true,
                giftSettings: true,
                livestreamSettings: true,
                guests: true,
                orders: { where: { status: 'SUCCESS' }, select: { addons: true, status: true } },
            },
        });
        },{isolationLevel:'Serializable',timeout:20000,maxWait:10000});

        return res.status(201).json({ message: 'Undangan berhasil dibuat.', invitation:await exposeWeddingGuests(prisma,invitation) });
    } catch (err) {
        console.error('Error createInvitation:', err);
        if(err.status)return res.status(err.status).json({error:err.message});
        if(err.quota)return res.status(403).json({error:err.message});
        if(err.code==='P2034')return res.status(409).json({error:'Ada perubahan bersamaan. Silakan ulangi pembuatan undangan.'});
        return res.status(500).json({ error: 'Gagal membuat undangan baru.' });
    }
}

// 2. Ambil Semua Undangan Milik User
export async function getMyInvitations(req, res) {
    try {
        const invitations = await prisma.invitation.findMany({
            where: { userId: req.userId },
            include: {
                wedding: true,
                coupleProfile: true,
                quoteSettings: true,
                themeSettings: true,
                invitationFeatures: true,
                events: true,
                rundowns: { orderBy: { order: 'asc' } },
                galleryMedia: { orderBy: { order: 'asc' } },
                timelineStories: { orderBy: { order: 'asc' } },
                giftSettings: true,
                livestreamSettings: true,
                guests: true,
                wishes: { orderBy: { createdAt: 'desc' } },
                orders: { where: { status: 'SUCCESS' }, select: { addons: true, status: true } },
                _count: { select: { guests: true, wishes: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json({ invitations:await Promise.all(invitations.map(inv=>exposeWeddingGuests(prisma,inv))) });
    } catch (err) {
        console.error('Error getMyInvitations:', err);
        return res.status(500).json({ error: 'Gagal mengambil daftar undangan.' });
    }
}

// 3. Update Undangan berdasarkan ID Undangan
export async function updateMyInvitation(req, res) {
    try {
        const { id } = req.params;

        const parsed = updateInvitationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        // Pastikan undangan milik user yang login
        const invitation = await prisma.invitation.findFirst({
            where: { id, userId: req.userId },
            include: { coupleProfile: true, quoteSettings: true, events: true, giftSettings: true, livestreamSettings: true, invitationFeatures: true },
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan atau bukan milik Anda.' });
        }

        const data = { ...parsed.data };
        if(data.themeId && data.themeId!==invitation.themeId && await themeHidden(data.themeId))return res.status(409).json({error:"Tema sedang tidak tersedia untuk desain baru."});

        // Kalau slug diganti, pastikan gak bentrok sama invitation lain
        if (data.slug && data.slug !== invitation.slug) {
            const newSlug = data.slug.toLowerCase();
            if (RESERVED_SLUGS.includes(newSlug)) {
                return res.status(400).json({ error: 'Slug/URL ini adalah kata yang dicadangkan oleh sistem dan tidak dapat digunakan.' });
            }

            const slugTaken = await prisma.invitation.findUnique({ where: { slug: newSlug } });
            if (slugTaken) {
                return res.status(409).json({ error: 'Slug/URL sudah dipakai, coba yang lain.' });
            }
            // Normalisasikan data sebelum di-update
            data.slug = newSlug;
        }

        if (['archived','trashed'].includes(invitation.status)) return res.status(409).json({error:'Pulihkan undangan ke draft sebelum mengedit.'});
        if (data.status === 'published') {
            if(invitation.suspendedAt)return res.status(403).json({error:'Undangan ditangguhkan admin.'});
            const checks=publicationChecklist(invitation);
            if(checks.some(c=>!c.ok)) return res.status(400).json({error:'Undangan belum siap diterbitkan.',checks});
        }

        // Hitung ulang masa kadaluwarsa jika tanggal berubah & bukan paket TRIAL
        if (data.weddingDate && invitation.packageType !== 'TRIAL') {
            data.expiresAt = new Date(new Date(data.weddingDate).getTime() + THIRTY_DAYS_MS);
        }

        const updated = await prisma.invitation.update({
            where: { id },
            data,
            include: {
                wedding: true,
                coupleProfile: true,
                quoteSettings: true,
                themeSettings: true,
                invitationFeatures: true,
                events: true,
                rundowns: { orderBy: { order: 'asc' } },
                galleryMedia: { orderBy: { order: 'asc' } },
                timelineStories: { orderBy: { order: 'asc' } },
                giftSettings: true,
                livestreamSettings: true,
                guests: true,
                wishes: { orderBy: { createdAt: 'desc' } },
                orders: { where: { status: 'SUCCESS' }, select: { addons: true, status: true } },
            },
        });

        return res.json({ message: 'Undangan berhasil diperbarui.', invitation:await exposeWeddingGuests(prisma,updated) });
    } catch (err) {
        console.error('Error updateMyInvitation:', err);
        return res.status(500).json({ error: 'Gagal memperbarui undangan.' });
    }
}

// 4. Hapus Undangan berdasarkan ID Undangan
export async function deleteInvitation(req, res) {
    try {
        const { id } = req.params;

        const invitation = await prisma.invitation.findFirst({
            where: { id, userId: req.userId },
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan atau bukan milik Anda.' });
        }

        if(req.body?.confirmSlug!==invitation.slug)return res.status(400).json({error:'Konfirmasi slug undangan diperlukan untuk penghapusan permanen.'});
        await indexLegacyAssets(req.userId);
        await prisma.$transaction(async tx=>{
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${req.userId}))`;
            if(invitation.weddingId)await tx.guest.updateMany({where:{invitationId:id,weddingId:null},data:{weddingId:invitation.weddingId}});
            await tx.illustrationGeneration.updateMany({where:{invitationId:id},data:{referenceUrls:[],resultUrl:null}});
            await tx.invitation.delete({where:{id}});
            if(invitation.weddingId&&await tx.invitation.count({where:{weddingId:invitation.weddingId}})===0&&await tx.guest.count({where:{weddingId:invitation.weddingId}})===0)await tx.wedding.delete({where:{id:invitation.weddingId}});
        },{timeout:20000,maxWait:10000});
        let cleanup;
        try{cleanup=await cleanupOwnerAssets(req.userId)}catch(e){console.error('Cleanup retry required:',e.message);cleanup={pending:1}}
        return res.json({message:cleanup.pending?'Undangan dihapus permanen. Pembersihan sebagian media sedang menunggu percobaan ulang.':'Undangan dihapus permanen. Tamu dan RSVP tetap tersimpan di pernikahan; media yang tidak dipakai sudah dibersihkan.',pendingCleanup:cleanup.pending});
    } catch (err) {
        console.error('Error deleteInvitation:', err);
        return res.status(500).json({ error: 'Gagal menghapus undangan.' });
    }
}

// 5. Endpoint Preview Pemilik (Berdasarkan ID Undangan)
export async function getMyPreview(req, res) {
    try {
        const { id } = req.params;

        const invitation = await prisma.invitation.findFirst({
            where: { id, userId: req.userId },
            include: {
                wedding: true,
                coupleProfile: true,
                quoteSettings: true,
                themeSettings: true,
                invitationFeatures: true,
                events: true,
                rundowns: { orderBy: { order: 'asc' } },
                galleryMedia: { orderBy: { order: 'asc' } },
                timelineStories: { orderBy: { order: 'asc' } },
                giftSettings: true,
                livestreamSettings: true,
                guests: true,
                wishes: { where: { isHidden: false }, orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] },
            },
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        const showWatermark = invitation.packageType === 'TRIAL';

        return res.json({ invitation:{...await exposeWeddingGuests(prisma,invitation),characterRenderAssets:await characterRenderAssets(invitation)}, showWatermark });
    } catch (err) {
        console.error('Error getMyPreview:', err);
        return res.status(500).json({ error: 'Gagal mengambil pratinjau undangan.' });
    }
}

// 6. Endpoint Publik Tamu (Berdasarkan Slug)
export async function getPublicInvitation(req, res) {
    try {
        const { slug } = req.params;

        const invitation = await prisma.invitation.findUnique({
            where: req.publicInvitationId ? { id: req.publicInvitationId } : { slug },
            include: {
                wedding: true,
                coupleProfile: true,
                quoteSettings: true,
                themeSettings: true,
                invitationFeatures: true,
                events: true,
                rundowns: { orderBy: { order: 'asc' } },
                galleryMedia: { orderBy: { order: 'asc' } },
                timelineStories: { orderBy: { order: 'asc' } },
                giftSettings: true,
                livestreamSettings: true,
                wishes: { where: { isHidden: false }, orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] },
            },
        });

        if (!invitation || (!req.publicInvitationId && await isPublicBlocked(invitation)) || (invitation.status !== 'published' || new Date(invitation.expiresAt) <= new Date())) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        res.set('Cache-Control', 'private, no-store');
        if (invitation.coupleProfile) {
            if (invitation.themeSettings?.brideInstagramEnabled === false) delete invitation.coupleProfile.brideIg;
            if (invitation.themeSettings?.groomInstagramEnabled === false) delete invitation.coupleProfile.groomIg;
        }
        const musicKey = invitationMusicKey(invitation.themeSettings?.musicUrl);
        if (musicKey) {
            invitation.themeSettings.musicUrl = '/api/invitations/public/' + encodeURIComponent(slug) + '/music?v=' + musicVersion(musicKey);
        }
        invitation.galleryMedia = invitation.galleryMedia.map(media => {
            if (media.type !== 'photo' || !galleryPhotoKey(media.url)) return media;
            const url = '/api/invitations/public/' + encodeURIComponent(slug) + '/photos/' + encodeURIComponent(media.id);
            return { ...media, url, thumbnailUrl: url };
        });
        const showWatermark = invitation.packageType === 'TRIAL';

        const [entitlements, rendered] = await Promise.all([getEntitlements(invitation), characterRenderAssets(invitation)]);
        const visitor = req.publicGuest;
        const guest = visitor ? {
            id: visitor.id, name: visitor.name, groupName: visitor.groupName,
            paxLimit: visitor.paxLimit, inviteStatus: 'opened', ...visitor.rsvp,
        } : null;
        if (visitor && visitor.inviteStatus !== 'opened') {
            void prisma.guest.updateMany({
                where: { id: visitor.id, inviteStatus: { not: 'opened' } },
                data: { inviteStatus: 'opened', openedAt: new Date() },
            }).catch(error => console.warn('Guest open tracking:', error.code));
        }
        return res.json({ invitation: { ...invitation, entitlements, characterRenderAssets: rendered }, guest, showWatermark });
    } catch (err) {
        console.error('Error getPublicInvitation:', err);
        return res.status(500).json({ error: 'Gagal mengambil data undangan publik.' });
    }
}

// 7. Endpoint Publik Tamu Spesifik (Berdasarkan Slug & GuestId)
export async function getPublicGuest(req, res) {
    try {
        const { slug, guestId } = req.params;

        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true, userId:true,suspendedAt:true,status: true, expiresAt: true, weddingId:true }
        });

        if (!invitation || await isPublicBlocked(invitation) || (invitation.status !== 'published' || new Date(invitation.expiresAt) <= new Date())) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        const guest = await prisma.guest.findFirst({
            where: {
                id: guestId,
                ...guestScope(invitation)
            },
            select: {
                id: true,
                name: true,
                groupName: true,
                paxLimit: true,
                inviteStatus: true,
                rsvp: { select: { attending: true, guestCount: true, note: true } },
            }
        });

        if (!guest) {
            return res.status(404).json({ error: 'Tamu tidak ditemukan.' });
        }

        if (guest.inviteStatus !== 'opened') {
            await prisma.guest.update({ where: { id: guest.id }, data: { inviteStatus: 'opened', openedAt: new Date() } });
        }

        return res.json({ guest: { ...guest, inviteStatus: 'opened', ...(guest.rsvp || {}), rsvp: undefined } });
    } catch (err) {
        console.error('Error getPublicGuest:', err);
        return res.status(500).json({ error: 'Gagal mengambil data tamu.' });
    }
}
export async function recordVisit(req, res) {
  try {
    const { slug } = req.params;
    const invitation = await prisma.invitation.findUnique({ where: { slug } });
    if (!invitation || await isPublicBlocked(invitation) || (invitation.status !== 'published' || new Date(invitation.expiresAt) <= new Date())) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { views: { increment: 1 } }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Error recordVisit:', err);
    return res.status(500).json({ error: 'Gagal mencatat visit' });
  }
}

const lifecycleInclude={coupleProfile:true,events:true,invitationFeatures:true,giftSettings:true,livestreamSettings:true};
export async function getPublicationChecklist(req,res){
 try{const invitation=await prisma.invitation.findFirst({where:{id:req.params.id,userId:req.userId},include:lifecycleInclude});if(!invitation)return res.status(404).json({error:'Undangan tidak ditemukan.'});const checks=publicationChecklist(invitation);res.json({checks,ready:checks.every(c=>c.ok)})}catch(e){res.status(500).json({error:'Checklist publikasi belum dapat dimuat.'})}
}
export async function changeInvitationLifecycle(req,res){
 try{const invitation=await prisma.invitation.findFirst({where:{id:req.params.id,userId:req.userId}});if(!invitation)return res.status(404).json({error:'Undangan tidak ditemukan.'});const status=lifecycleTransition(invitation.status,req.body.action);if(!status)return res.status(400).json({error:'Perubahan status ini tidak tersedia.'});const changed=await prisma.invitation.update({where:{id:invitation.id},data:{status}});res.json({invitation:changed})}catch(e){res.status(500).json({error:'Gagal mengubah status undangan.'})}
}
export async function duplicateInvitation(req,res){
 try{
 const source=await prisma.invitation.findFirst({where:{id:req.params.id,userId:req.userId,status:{not:'trashed'}},include:{...lifecycleInclude,quoteSettings:true,themeSettings:true,rundowns:true,galleryMedia:true,timelineStories:true}});
 if(!source)return res.status(404).json({error:'Undangan tidak ditemukan.'});
 await indexLegacyAssets(req.userId);
 const slug=await generateUniqueSlug(source.slug+'-salinan');
 const invitation=await prisma.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${req.userId}))`;
 if(!await tx.invitation.findFirst({where:{id:source.id,userId:req.userId}}))throw new Error('Undangan sumber sudah dihapus.');
 const existing=await tx.invitation.findMany({where:{userId:req.userId},select:{packageType:true,status:true}});
 if(existing.length>=3)throw Object.assign(new Error('Maksimal 3 undangan per akun termasuk arsip. Hapus permanen undangan yang tidak digunakan untuk membuka slot.'),{quota:true});
 return tx.invitation.create({data:{userId:req.userId,weddingId:source.weddingId,slug,themeId:source.themeId,weddingDate:source.weddingDate,expiresAt:new Date(new Date(source.weddingDate).getTime()+THIRTY_DAYS_MS),status:'draft',packageType:'TRIAL',...cloneContent(source)},include:{coupleProfile:true}})
 },{isolationLevel:'Serializable',timeout:20000,maxWait:10000});
 await cleanupOwnerAssets(req.userId).catch(e=>console.error('Asset reference refresh:',e.message));
 res.status(201).json({invitation,message:'Salinan draft dibuat. Tamu, ucapan, statistik, dan pembayaran tidak disalin.'});
 }catch(e){console.error('Duplicate invitation failed:',e.message);res.status(e.quota?403:e.code==='P2034'?409:500).json({error:e.quota?e.message:e.code==='P2034'?'Ada perubahan bersamaan. Silakan ulangi.':'Gagal membuat salinan undangan.'})}
}

export async function getStorageUsage(req,res){try{res.json(await storageUsage(req.userId))}catch(e){res.status(e.status||500).json({error:e.message||'Pemakaian penyimpanan belum dapat dimuat.'})}}

export async function getPublicGalleryPhoto(req, res) {
    try {
        const { slug, mediaId } = req.params;
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true, userId: true, suspendedAt: true, status: true, expiresAt: true },
        });
        if (!invitation || invitation.status !== 'published' || invitation.expiresAt <= new Date() || await isPublicBlocked(invitation)) {
            return res.sendStatus(404);
        }
        const media = await prisma.galleryMedia.findFirst({
            where: { id: mediaId, invitationId: invitation.id, type: 'photo' },
            select: { url: true },
        });
        const key = galleryPhotoKey(media?.url);
        if (!key) return res.sendStatus(404);
        const object = await openGalleryPhoto(key);
        const extension = key.split('.').pop().toLowerCase();
        res.set('Content-Type', extension === 'webp' ? 'image/webp' : extension === 'png' ? 'image/png' : 'image/jpeg');
        if (Number.isFinite(object.ContentLength)) res.set('Content-Length', String(object.ContentLength));
        res.set('Cache-Control', 'private, no-store');
        await pipeline(object.Body, res);
    } catch (error) {
        if (res.headersSent || res.destroyed) return;
        return res.sendStatus(error.name === 'NoSuchKey' ? 404 : 503);
    }
}

const musicVersion = key => createHash('sha256').update(key).digest('hex').slice(0, 16);

export async function getPublicInvitationMusic(req, res) {
    try {
        const invitation = await prisma.invitation.findUnique({
            where: { slug: req.params.slug },
            include: { themeSettings: true, invitationFeatures: true },
        });
        if (!invitation || invitation.status !== 'published' || invitation.expiresAt <= new Date() ||
            invitation.invitationFeatures?.musicEnabled === false || await isPublicBlocked(invitation)) return res.sendStatus(404);
        const key = invitationMusicKey(invitation.themeSettings?.musicUrl);
        if (!key || req.query.v !== musicVersion(key)) return res.sendStatus(404);
        const range = req.get('Range');
        if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) return res.sendStatus(416);
        const object = await openInvitationMusic(key, range);
        res.set('Content-Type', { mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac' }[key.split('.').pop().toLowerCase()]);
        res.set('Cache-Control', 'private, no-store');
        res.set('Accept-Ranges', 'bytes');
        if (Number.isFinite(object.ContentLength)) res.set('Content-Length', String(object.ContentLength));
        if (object.ContentRange) res.status(206).set('Content-Range', object.ContentRange);
        if (req.method === 'HEAD') { object.Body.destroy(); return res.end(); }
        await pipeline(object.Body, res);
    } catch (error) {
        if (res.headersSent || res.destroyed) return;
        return res.sendStatus(error.$metadata?.httpStatusCode === 416 ? 416 : error.name === 'NoSuchKey' ? 404 : 503);
    }
}
