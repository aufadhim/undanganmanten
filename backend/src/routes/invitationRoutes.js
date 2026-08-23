import { Router } from 'express';
import {
    createInvitation,
    getMyInvitations,
    getMyPreview,
    updateMyInvitation,
    deleteInvitation,
    getPublicInvitation,
    getPublicGuest,
    recordVisit,
} from '../controllers/invitationController.js';
import { createCheckout } from '../controllers/paymentController.js';
import { updateMyThemeSettings, applyThemePreset } from '../controllers/themeController.js';
import { updateCoupleProfile, uploadCouplePhoto } from '../controllers/coupleProfileController.js';
import { updateQuoteSettings } from '../controllers/quoteController.js';
import { upsertEvent, listMyEvents, deleteEvent } from '../controllers/eventController.js';
import {
    listGallery,
    uploadGalleryMedia,
    deleteGalleryMedia,
    reorderGallery,
    addGalleryLink,
} from '../controllers/galleryController.js';
import {
    listTimeline,
    createTimelineStory,
    updateTimelineStory,
    deleteTimelineStory,
} from '../controllers/timelineController.js';
import {
    listGuests,
    addGuest,
    bulkAddGuests,
    updateGuest,
    deleteGuest,
    blastInvitation,
    exportGuests,
    checkInGuest,
} from '../controllers/guestController.js';
import {
    submitRsvp,
    submitWish,
    getMyRsvpSummary,
    deleteWish,
    replyWish,
    updateWish,
} from '../controllers/rsvpWishController.js';
import {
    createRundown,
    updateRundown,
    deleteRundown,
    reorderRundowns
} from '../controllers/rundownController.js';
import {
    upsertGiftSettings,
    upsertLivestreamSettings,
    updateInvitationFeatures,
} from '../controllers/settingsController.js';
import { authenticate } from '../middlewares/auth.js';
import { galleryUpload, imageUpload } from '../middlewares/upload.js';
import { compressImage } from '../middlewares/compressImage.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const publicFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat.' },
});
const visitLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

// ==========================================
// 1. RUTE PUBLIK (Dapat diakses tanpa Login)
// ==========================================
router.get('/public/:slug', getPublicInvitation);
router.post('/public/:slug/visit', visitLimiter, recordVisit);
router.get('/public/:slug/guest/:guestId', getPublicGuest);
router.post('/public/:slug/rsvp', publicFormLimiter, submitRsvp);
router.post('/public/:slug/wishes', publicFormLimiter, submitWish);

// ==========================================
// 2. RUTE PRIVAT (Wajib Login / Authenticate)
// ==========================================

// ---------- Theme ----------
router.patch('/me/theme', authenticate, updateMyThemeSettings);
router.post('/me/theme/apply-preset', authenticate, applyThemePreset);

// ---------- Couple Profile ----------
router.patch('/me/couple-profile', authenticate, updateCoupleProfile);
router.post('/me/couple-profile/photo', authenticate, imageUpload.single('photo'), compressImage, uploadCouplePhoto);

// ---------- Quote Settings ----------
router.patch('/me/quote', authenticate, updateQuoteSettings);

// ---------- Events ----------
router.get('/me/events', authenticate, listMyEvents);
router.post('/me/events', authenticate, upsertEvent);
router.delete('/me/events/:eventId', authenticate, deleteEvent);

// ---------- Gallery ----------
router.get('/me/gallery', authenticate, listGallery);
router.post('/me/gallery', authenticate, galleryUpload.single('file'), compressImage, uploadGalleryMedia);
router.post('/me/gallery/link', authenticate, addGalleryLink);
router.delete('/me/gallery/:mediaId', authenticate, deleteGalleryMedia);
router.patch('/me/gallery/reorder', authenticate, reorderGallery);

// ---------- Timeline Story ----------
router.get('/me/timeline', authenticate, listTimeline);
router.post('/me/timeline', authenticate, createTimelineStory);
router.patch('/me/timeline/:storyId', authenticate, updateTimelineStory);
router.delete('/me/timeline/:storyId', authenticate, deleteTimelineStory);

// ---------- Guests & Blast ----------
router.get('/me/guests', authenticate, listGuests);
router.get('/me/guests/export', authenticate, exportGuests);
router.post('/me/guests', authenticate, addGuest);
router.post('/me/guests/bulk', authenticate, bulkAddGuests);
router.patch('/me/guests/:guestId', authenticate, updateGuest);
router.delete('/me/guests/:guestId', authenticate, deleteGuest);
router.post('/me/guests/blast', authenticate, blastInvitation);
router.post('/me/guests/:guestId/checkin', authenticate, checkInGuest);

// ---------- RSVP & Wishes (Dashboard) ----------
router.get('/me/rsvp-summary', authenticate, getMyRsvpSummary);
router.delete('/me/wishes/:wishId', authenticate, deleteWish);
router.post('/me/wishes/:wishId/reply', authenticate, replyWish);
router.patch('/me/wishes/:wishId', authenticate, updateWish);

// ---------- Rundowns ----------
router.post('/me/rundowns', authenticate, createRundown);
router.post('/me/rundowns/reorder', authenticate, reorderRundowns);
router.patch('/me/rundowns/:id', authenticate, updateRundown);
router.delete('/me/rundowns/:id', authenticate, deleteRundown);

// ---------- Settings & Toggles ----------
router.patch('/me/gift-settings', authenticate, upsertGiftSettings);
router.patch('/me/livestream-settings', authenticate, upsertLivestreamSettings);
router.patch('/me/features', authenticate, updateInvitationFeatures);

// ---------- Invitation Inti (Parameter Dinamis) ----------
router.post('/', authenticate, createInvitation);               // Buat draft undangan baru
router.get('/', authenticate, getMyInvitations);                // Ambil daftar semua undangan user
router.get('/:id/preview', authenticate, getMyPreview);         // Preview undangan tertentu
router.post('/:id/checkout', authenticate, createCheckout);       // Checkout per invitation
router.patch('/:id', authenticate, updateMyInvitation);         // Update data undangan tertentu
router.put('/:id', authenticate, updateMyInvitation);           // Alias PUT
router.delete('/:id', authenticate, deleteInvitation);          // Hapus undangan berdasarkan ID

export default router;
