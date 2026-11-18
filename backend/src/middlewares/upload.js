import multer from 'multer';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = ['video/mp4', 'video/quicktime'];
const AUDIO_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac'];

function createUpload(allowedMimes, maxSizeMb, label) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter(req, file, callback) {
      if (allowedMimes.includes(file.mimetype)) return callback(null, true);
      const error = new Error(`Tipe file tidak didukung untuk ${label}.`);
      error.status = 400;
      return callback(error);
    },
  });
}

export const imageUpload = createUpload(IMAGE_MIMES, 5, 'gambar');
export const galleryUpload = createUpload([...IMAGE_MIMES, ...VIDEO_MIMES], 10, 'galeri');
export const themeAssetUpload = createUpload([...IMAGE_MIMES, ...AUDIO_MIMES], 8, 'aset tema');
