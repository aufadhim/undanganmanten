export const DUMMY_EVENTS = [
  { id: 'dummy-event-akad', type: 'Akad Nikah', date: '2026-12-05', startTime: '08:00', endTime: '10:00', venueName: 'The Garden Hall', address: 'Jl. Senja Indah No. 8, Jakarta' },
  { id: 'dummy-event-reception', type: 'Resepsi', date: '2026-12-05', startTime: '11:00', endTime: '14:00', venueName: 'The Garden Hall', address: 'Jl. Senja Indah No. 8, Jakarta' },
];

export const DUMMY_RUNDOWNS = [
  { id: 'dummy-rundown-1', time: '08:00', activity: 'Akad Nikah', description: 'Prosesi ijab kabul dan doa bersama.' },
  { id: 'dummy-rundown-2', time: '10:30', activity: 'Sesi Foto', description: 'Mengabadikan momen bersama keluarga dan sahabat.' },
  { id: 'dummy-rundown-3', time: '11:00', activity: 'Resepsi', description: 'Ramah tamah dan perayaan hari bahagia.' },
];

export const DUMMY_GIFT = {
  type: 'both',
  enabledMode: 'both',
  bankAccounts: [{ id: 'dummy-bank', bankName: 'Bank Central Asia', accountNumber: '1234567890', accountHolder: 'Arunika Candramawarni' }],
  shippingAddress: 'Arunika Candramawarni, Jl. Senja Indah No. 8, Jakarta',
  recipientName: 'Arunika Candramawarni',
};

export const DUMMY_LIVESTREAM = { url: '/assets/gallery/dummy-gallery-video.mp4', platform: 'Video Preview', isPreviewDummy: true };
export const DUMMY_INSTAGRAM_FILTER = { url: '#', isPreviewDummy: true };

export const DUMMY_WISHES = [
  { id: 'dummy-wish-1', senderName: 'Nadira & Irfan', message: 'Selamat menempuh perjalanan baru. Semoga cinta kalian selalu tumbuh dalam kebahagiaan dan keberkahan.', createdAt: '2026-08-23T10:00:00.000Z', isHidden: false },
  { id: 'dummy-wish-2', senderName: 'Adrian', message: 'Bahagia selalu untuk kalian berdua. Semoga setiap langkah ke depan dipenuhi cerita yang indah.', createdAt: '2026-08-22T09:00:00.000Z', isHidden: false },
  { id: 'dummy-wish-3', senderName: 'Daffa', message: 'Selamat atas hari istimewanya. Semoga menjadi keluarga yang hangat, saling menjaga, dan penuh cinta.', createdAt: '2026-08-21T08:00:00.000Z', isHidden: false },
];

export function previewFeatureEnabled(value, editorPreview, publicDefault = false) {
  if (value === false) return false;
  if (editorPreview) return true;
  return value === undefined ? publicDefault : Boolean(value);
}

export function previewList(saved, dummy, editorPreview) {
  return Array.isArray(saved) && saved.length ? saved : (editorPreview ? dummy : (saved || []));
}

export function sortWeddingEvents(events = []) {
  const rank = (event) => {
    const type = String(event?.type || '').toLowerCase();
    if (type.includes('akad') || type.includes('pemberkatan')) return 0;
    if (type.includes('resepsi') || type.includes('reception') || type.includes('perayaan')) return 1;
    return 2;
  };
  return [...events].sort((a, b) => rank(a) - rank(b));
}

export function hasGiftInformation(gift = {}) {
  return Boolean(gift.shippingAddress || gift.accountNumber || gift.bankAccounts?.length);
}

export function previewGift(saved, editorPreview) {
  return hasGiftInformation(saved) ? saved : (editorPreview ? DUMMY_GIFT : (saved || {}));
}
