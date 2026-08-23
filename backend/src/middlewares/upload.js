import multer from 'multer';

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Hanya menerima Gambar, Video Pendek, atau Audio (MP3/WAV).'));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter,
});