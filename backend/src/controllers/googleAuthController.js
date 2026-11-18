import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';

// Pastikan untuk menambahkan GOOGLE_CLIENT_ID di .env Anda
const client = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

export async function googleLogin(req, res) {
  if (!client) {
    return res.status(503).json({ error: 'Google Login belum dikonfigurasi.' });
  }
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Token Google tidak disertakan.' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    if (!email) {
      return res.status(400).json({ error: 'Gagal mendapatkan email dari Google.' });
    }

    // Cek apakah user sudah terdaftar
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Jika belum terdaftar, buat akun baru
      // Karena login via Google, kita anggap email sudah terverifikasi (isVerified: true)
      // Kita buat password dummy acak karena user login pakai Google
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: '', // Kosongkan atau isi random, tidak bisa dipakai login biasa
          isVerified: true, 
          // (Opsional) simpan googleId di schema jika Anda tambahkan field tsb
        },
      });
    } else if (!user.isVerified) {
      // Jika user terdaftar via email tapi belum diverifikasi,
      // Karena dia berhasil verifikasi via Google, kita auto-verify akunnya
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationToken: null },
      });
    }

    if(user.suspendedAt)return res.status(403).json({error:'Akun ditangguhkan. Hubungi dukungan.'});
    const token = generateToken({ userId: user.id });

    return res.json({
      message: 'Login Google berhasil.',
      token,
      user: { id: user.id, email: user.email, name, role: user.role },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(401).json({ error: 'Autentikasi Google gagal atau token kedaluwarsa.' });
  }
}
