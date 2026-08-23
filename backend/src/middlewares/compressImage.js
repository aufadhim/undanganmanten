import sharp from 'sharp';
import path from 'path';

export async function compressImage(req, res, next) {
  if (!req.file) return next();

  // Hanya proses jika file adalah gambar
  if (req.file.mimetype.startsWith('image/')) {
    try {
      // Ubah gambar ke webp & resize max width 1920
      const compressedBuffer = await sharp(req.file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      req.file.buffer = compressedBuffer;
      req.file.mimetype = 'image/webp';

      // Mengganti ekstensi dengan aman menggunakan path.parse
      const parsedPath = path.parse(req.file.originalname);
      req.file.originalname = `${parsedPath.name}.webp`;
    } catch (error) {
      console.error('Gagal kompresi gambar:', error);
      return res.status(500).json({ error: 'Gagal memproses gambar.' });
    }
  }

  next();
}