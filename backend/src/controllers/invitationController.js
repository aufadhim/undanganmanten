import { prisma } from '../lib/prisma.js';
import { generateUniqueSlug } from '../utils/slug.js';
import { createInvitationSchema, updateInvitationSchema } from '../utils/validators.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const RESERVED_SLUGS = ['login', 'signup', 'forgot-password', 'reset-password', 'dashboard', 'sandbox', 'admin', 'terms', 'privacy', 'guide', 'tema', 'api', 'i'];

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

        // Validasi batasan kuota undangan: Maksimal 3 draft, jika mau buat ke-4 harus ada min 1 yang dipublish/bayar
        const existingInvitations = await prisma.invitation.findMany({
            where: { userId: req.userId },
            select: { id: true, status: true, packageType: true }
        });

        if (existingInvitations.length >= 3) {
            const hasPublishedOrPaid = existingInvitations.some(
                (inv) => inv.status === 'published' || inv.packageType !== 'TRIAL'
            );
            if (!hasPublishedOrPaid) {
                return res.status(403).json({
                    error: 'Batas maksimal 3 undangan draft telah tercapai. Harap publikasikan / aktivasi minimal 1 undangan terlebih dahulu sebelum membuat undangan ke-4.'
                });
            }
        }
        const { groomName, brideName, weddingDate, themeId, customSlug } = parsed.data;

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

        const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + TWO_DAYS_MS);

        const invitation = await prisma.invitation.create({
            data: {
                userId: req.userId,
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
                    create: DEFAULT_THEME_SETTINGS,
                },
                invitationFeatures: {
                    create: {
                        rsvpEnabled: true,
                        giftEnabled: true,
                        livestreamEnabled: true,
                        timelineEnabled: true,
                        storyEnabled: true,
                        animationEnabled: true,
                        customLogoEnabled: true,
                        musicEnabled: true,
                        dresscodeEnabled: true,
                        igFilterEnabled: true,
                        rundownEnabled: true,
                    },
                },
            },
            include: {
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
            },
        });

        return res.status(201).json({ message: 'Undangan berhasil dibuat.', invitation });
    } catch (err) {
        console.error('Error createInvitation:', err);
        return res.status(500).json({ error: 'Gagal membuat undangan baru.' });
    }
}

// 2. Ambil Semua Undangan Milik User
export async function getMyInvitations(req, res) {
    try {
        const invitations = await prisma.invitation.findMany({
            where: { userId: req.userId },
            include: {
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
                _count: { select: { guests: true, wishes: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json({ invitations });
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
            include: { coupleProfile: true, quoteSettings: true, events: true },
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan atau bukan milik Anda.' });
        }

        const data = { ...parsed.data };

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

        // Validasi kelengkapan data sebelum publish
        if (data.status === 'published') {
            const profile = invitation.coupleProfile;
            if (!profile || !profile.brideName || !profile.groomName) {
                return res.status(400).json({ error: 'Data profil pengantin belum lengkap. Tidak bisa dipublikasi.' });
            }
            if (!invitation.events || invitation.events.length === 0) {
                return res.status(400).json({ error: 'Minimal harus ada 1 acara (akad/resepsi) sebelum dipublikasi.' });
            }
        }

        // Hitung ulang masa kadaluwarsa jika tanggal berubah & bukan paket TRIAL
        if (data.weddingDate && invitation.packageType !== 'TRIAL') {
            data.expiresAt = new Date(new Date(data.weddingDate).getTime() + THIRTY_DAYS_MS);
        }

        const updated = await prisma.invitation.update({
            where: { id },
            data,
            include: {
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
            },
        });

        return res.json({ message: 'Undangan berhasil diperbarui.', invitation: updated });
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

        await prisma.invitation.delete({
            where: { id },
        });

        return res.json({ message: 'Undangan berhasil dihapus.' });
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
            },
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        const showWatermark = invitation.packageType === 'TRIAL';

        return res.json({ invitation, showWatermark });
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
            where: { slug },
            include: {
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
                wishes: { orderBy: { createdAt: 'desc' } },
            },
        });

        if (!invitation || invitation.status !== 'published') {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        const showWatermark = invitation.packageType === 'TRIAL';

        return res.json({ invitation, showWatermark });
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
            select: { id: true }
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
        }

        const guest = await prisma.guest.findFirst({
            where: {
                id: guestId,
                invitationId: invitation.id
            }
        });

        if (!guest) {
            return res.status(404).json({ error: 'Tamu tidak ditemukan.' });
        }

        return res.json({ guest });
    } catch (err) {
        console.error('Error getPublicGuest:', err);
        return res.status(500).json({ error: 'Gagal mengambil data tamu.' });
    }
}
export async function recordVisit(req, res) {
  try {
    const { slug } = req.params;
    const invitation = await prisma.invitation.findUnique({ where: { slug } });
    if (!invitation) return res.status(404).json({ error: 'Undangan tidak ditemukan.' });

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
