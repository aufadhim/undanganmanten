import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { deleteFolderFromR2 } from '../lib/storage.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email.js';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../utils/validators.js';

const SALT_ROUNDS = 10;

// Helper generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/signup
export async function signup(req, res) {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email: rawEmail, password, phone } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOTP();

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        phone: phone ? phone.trim() : null,
        verificationToken: otp,
      },
    });

    // Kirim email verifikasi
    if (process.env.NODE_ENV !== 'production' && email.includes('@test.com')) {
      console.log(`[TEST MODE] OTP for ${email} is ${otp}`);
    } else {
      sendVerificationEmail(email, otp).catch((err) =>
        console.error('Gagal mengirim email verifikasi:', err)
      );
    }

    return res.status(201).json({
      message: 'Akun berhasil dibuat. Silakan cek email Anda untuk kode verifikasi.',
    });
  } catch (err) {
    console.error('Error signup:', err);
    return res.status(500).json({ error: 'Gagal mendaftar akun baru.' });
  }
}

// POST /api/auth/verify-email
export async function verifyEmail(req, res) {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email: rawEmail, otp } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email sudah diverifikasi.' });
    }

    if (user.verificationToken !== otp) {
      // Bypass untuk E2E testing
      if (process.env.NODE_ENV !== 'production' && otp === '123456') {
        console.log(`[TEST MODE] Bypassed OTP for ${email}`);
      } else {
        return res.status(400).json({ error: 'Kode verifikasi salah.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    const token = generateToken({ userId: updatedUser.id });

    return res.json({
      message: 'Email berhasil diverifikasi.',
      token,
      user: { id: updatedUser.id, email: updatedUser.email },
    });
  } catch (err) {
    console.error('Error verifyEmail:', err);
    return res.status(500).json({ error: 'Gagal memverifikasi email.' });
  }
}

// POST /api/auth/resend-otp
export async function resendOtp(req, res) {
  try {
    const { email: rawEmail } = req.body || {};
    if (!rawEmail) {
      return res.status(400).json({ error: 'Email diperlukan.' });
    }

    const email = rawEmail.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email sudah diverifikasi.' });
    }

    const otp = generateOTP();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: otp },
    });

    if (process.env.NODE_ENV !== 'production' && email.includes('@test.com')) {
      console.log(`[TEST MODE] Resent OTP for ${email} is ${otp}`);
    } else {
      sendVerificationEmail(email, otp).catch((err) =>
        console.error('Gagal mengirim ulang OTP:', err)
      );
    }

    return res.json({ message: 'Kode OTP baru telah dikirim ke email Anda.' });
  } catch (err) {
    console.error('Error resendOtp:', err);
    return res.status(500).json({ error: 'Gagal mengirim ulang OTP.' });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email: rawEmail, password } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Jika user login via Google dan belum punya passwordHash
    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'Akun ini terdaftar menggunakan Google Auth. Silakan login dengan Google.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Email belum diverifikasi. Silakan verifikasi terlebih dahulu.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const token = generateToken({ userId: user.id });

    return res.json({
      message: 'Login berhasil.',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Error login:', err);
    return res.status(500).json({ error: 'Gagal melakukan login.' });
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email: rawEmail } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpires: expires },
      });

      sendResetPasswordEmail(email, resetToken).catch((err) =>
        console.error('Gagal mengirim email reset password:', err)
      );
    }

    return res.json({
      message: 'Jika email terdaftar, instruksi reset password telah dikirim.',
    });
  } catch (err) {
    console.error('Error forgotPassword:', err);
    return res.status(500).json({ error: 'Gagal memproses permintaan reset password.' });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { token, newPassword } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: 'Token reset password tidak valid atau sudah kedaluwarsa.',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        isVerified: true, // Sekaligus verifikasi akun jika sebelumnya belum
      },
    });

    return res.json({
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    });
  } catch (err) {
    console.error('Error resetPassword:', err);
    return res.status(500).json({ error: 'Gagal mereset password.' });
  }
}

// PATCH /api/auth/change-password
export async function changePassword(req, res) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { oldPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'Akun ini menggunakan Google Login dan belum memiliki password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password lama salah.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return res.json({ message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error('Error changePassword:', err);
    return res.status(500).json({ error: 'Gagal mengubah password.' });
  }
}

// DELETE /api/auth/delete-account
export async function deleteAccount(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { invitation: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    // Jika punya undangan, hapus file media di R2 jika terkonfigurasi
    if (user.invitation) {
      try {
        await deleteFolderFromR2(`invitations/${user.invitation.id}`);
      } catch (err) {
        console.error(`Gagal menghapus folder R2 untuk undangan ${user.invitation.id}:`, err);
      }
    }

    await prisma.user.delete({ where: { id: user.id } });

    return res.json({
      message: 'Akun dan semua data undangan berhasil dihapus secara permanen.',
    });
  } catch (err) {
    console.error('Error deleteAccount:', err);
    return res.status(500).json({ error: 'Gagal menghapus akun.' });
  }
}

// GET /api/auth/me
export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('Error me:', err);
    return res.status(500).json({ error: 'Gagal mengambil data user.' });
  }
}

// POST /api/auth/test-reset
export async function testReset(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }

  try {
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@test.com',
        },
      },
    });
    return res.json({ message: 'Test data cleared' });
  } catch (err) {
    console.error('Test reset error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
