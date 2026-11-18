import sharp from 'sharp';
import path from 'path';

export async function compressImage(req, res, next) {
  if (!req.file) return next();

  const max=req.file.mimetype.startsWith('image/')?5:req.file.mimetype.startsWith('audio/')?8:10;
  if(req.file.size>max*1024*1024)return res.status(413).json({error:`Ukuran file maksimal ${max} MB.`});
  // Hanya proses jika file adalah gambar
  if (req.file.mimetype.startsWith('image/')) {
    try {
      // Ubah gambar ke webp & resize max width 1920
      const compressedBuffer = await sharp(req.file.buffer)
        .rotate().resize({ width: 1280, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
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