import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan. Silakan login.' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try { decoded=verifyToken(token); } catch { return res.status(401).json({error:'Token tidak valid atau sudah kadaluarsa.'}); }
  if(!decoded?.userId)return res.status(401).json({error:'Sesi tidak valid. Silakan login kembali.'});
  try {
    const account=await prisma.user.findUnique({where:{id:decoded.userId},select:{suspendedAt:true}});
    if(!account)return res.status(401).json({error:'Akun tidak ditemukan.'});
    if(account.suspendedAt)return res.status(403).json({error:'Akun ditangguhkan. Hubungi dukungan.'});
    req.userId=decoded.userId;
    next();
  } catch { return res.status(503).json({error:'Layanan akun sedang tidak tersedia. Coba lagi sebentar.'}); }

}

export async function requireAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak. Khusus Akun Admin.' });
    }
    next();
  } catch (err) {
    console.error('Error requireAdmin:', err);
    return res.status(500).json({ error: 'Gagal memverifikasi hak akses admin.' });
  }
}