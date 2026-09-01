export const DUMMY_BRIDE_PHOTO = 'https://images.unsplash.com/photo-1492175742197-ed20dc5a6bed?q=85&w=1100&auto=format&fit=crop';
export const DUMMY_GROOM_PHOTO = '/assets/dummy-groom.webp';

export function getGroomPhoto(photo) {
  if (!photo || photo.includes('photo-1506794778202-cad84cf45f1d')) return DUMMY_GROOM_PHOTO;
  return photo;
}

export const DUMMY_GALLERY_PHOTOS = [
  '/assets/gallery/dummy-gallery-01.webp',
  '/assets/gallery/dummy-gallery-02.webp',
  '/assets/gallery/dummy-gallery-03.webp',
  '/assets/gallery/dummy-gallery-04.webp',
  '/assets/gallery/dummy-gallery-05.webp',
  '/assets/gallery/dummy-gallery-06.webp',
  '/assets/gallery/dummy-gallery-07.webp',
  '/assets/gallery/dummy-gallery-08.webp',
];

export const DUMMY_GALLERY_VIDEO = '/assets/gallery/dummy-gallery-video.mp4';
