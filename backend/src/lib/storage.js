import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

const isR2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

let r2Client = null;
if (isR2Configured) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadToR2({ buffer, mimeType, folder = '', originalName = 'file.webp' }) {
  const ext = originalName.split('.').pop() || 'webp';
  const fileName = `${randomUUID()}.${ext}`;

  // 1. Upload ke Cloudflare R2 jika terkonfigurasi
  if (isR2Configured && r2Client) {
    const key = folder ? `${folder}/${fileName}` : fileName;
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      );
      return `${process.env.R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('[R2 Upload Failed, fallback to local disk]:', error.message);
    }
  }

  // 2. Simpan ke local disk backend/uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFilePath = path.join(uploadsDir, fileName);
  await fs.promises.writeFile(localFilePath, buffer);

  // 🚨 KUNCI PERBAIKAN: Kembalikan URL lengkap dengan Port 4000
  return `${env.backendUrl}/uploads/${fileName}`;
}

export async function deleteFolderFromR2(folderPrefix) {
  if (!isR2Configured || !r2Client) return;
  try {
    const list = await r2Client.send(
      new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, Prefix: folderPrefix })
    );
    if (!list.Contents || list.Contents.length === 0) return;
    for (const obj of list.Contents) {
      await r2Client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: obj.Key }));
    }
  } catch (err) {
    console.error('Gagal menghapus folder dari R2:', err.message);
  }
}
