import { Resend } from 'resend';
import { env } from '../config/env.js';

// Menggunakan API key dari environment variable, atau mock jika belum ada
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_123');

// Gunakan email default Resend untuk testing jika belum punya domain
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export async function sendVerificationEmail(toEmail, otp) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${toEmail}, OTP Verification: ${otp}`);
    return;
  }

  try {
    await resend.emails.send({
      from: `UndanganManten <${FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Verifikasi Email Anda',
      html: `<p>Kode verifikasi Anda adalah: <strong>${otp}</strong></p><p>Kode ini berlaku selama 15 menit.</p>`,
    });
    console.log(`Email terkirim ke ${toEmail}`);
  } catch (error) {
    console.error('Gagal mengirim email verifikasi:', error);
  }
}

export async function sendResetPasswordEmail(toEmail, resetToken) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${toEmail}, Reset Token: ${resetToken}`);
    return;
  }

  // Ganti dengan URL frontend yang sesuai nanti
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: `UndanganManten <${FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Reset Password Anda',
      html: `<p>Klik link berikut untuk mereset password Anda:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link ini berlaku selama 1 jam.</p>`,
    });
  } catch (error) {
    console.error('Gagal mengirim email reset password:', error);
  }
}
