import { Resend } from 'resend';
import { readFileSync } from 'node:fs';
import { env } from '../config/env.js';

// Menggunakan API key dari environment variable, atau mock jika belum ada
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_123');

// Gunakan email default Resend untuk testing jika belum punya domain
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const brandMark = {
  filename: 'samavaya-mark.png',
  content: readFileSync(new URL('./samavaya-email-mark.png', import.meta.url)),
  contentId: 'samavaya-mark',
};

function accountEmail(title, content) {
  return `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#eee9db;color:#283229;font:16px/1.6 Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eee9db">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fffdf6;border:1px solid #d8d4c2;border-top:5px solid #657851">
        <tr><td align="center" style="padding:24px 20px 20px;background:#f4f0e4;border-bottom:1px solid #ded8c4">
          <img src="cid:samavaya-mark" width="46" height="46" alt="" style="display:block;margin:0 auto 6px">
          <p style="margin:0;color:#40573e;font:32px/1.1 Georgia,serif">samavaya</p>
          <p style="margin:8px 0 0;color:#526746;font-size:10px;letter-spacing:2px">SEBUAH KABAR BAHAGIA</p>
        </td></tr>
        <tr><td style="padding:26px 24px 18px">
          <p style="margin:0;color:#526746;font-size:11px;letter-spacing:2px">AKUN SAMAVAYA</p>
          <h1 style="margin:6px 0 16px;color:#344832;font:30px/1.2 Georgia,serif">${title}</h1>
          ${content}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#eef0e6;border-top:1px solid #dce1d4;color:#465446;font-size:13px">
          Jika kamu tidak meminta ini, abaikan email ini. Pesan ini dikirim otomatis. Mohon jangan membalas.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendVerificationEmail(toEmail, otp) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${toEmail}, OTP Verification: ${otp}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: `Samavaya <${FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Verifikasi Email Anda',
      attachments: [brandMark],
      text: `Kode verifikasi Samavaya: ${otp}. Berlaku selama 10 menit. Jangan bagikan kode ini.`,
      html: accountEmail('Verifikasi alamat email', `<p>Masukkan kode berikut di Samavaya untuk menyelesaikan pendaftaran.</p>
    <p style="padding:12px;background:#edf1e8;color:#283229;font-size:28px;font-weight:bold;letter-spacing:6px;text-align:center">${otp}</p>
    <p>Kode berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>`),
    });
    if (error) throw error;
    console.log(`Email terkirim ke ${toEmail}`);
  } catch (error) {
    console.error('Gagal mengirim email verifikasi:', error);
    throw error;
  }
}

export async function sendResetPasswordEmail(toEmail, resetToken) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${toEmail}, Reset Token: ${resetToken}`);
    return;
  }

  const resetUrl = new URL('/reset-password', env.frontendUrl);
  resetUrl.searchParams.set('token', resetToken);
  const resetHref = resetUrl.href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  try {
    const { error } = await resend.emails.send({
      from: `Samavaya <${FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Reset Password Anda',
      attachments: [brandMark],
      text: `Atur ulang kata sandi Samavaya: ${resetUrl}. Tautan berlaku selama 1 jam.`,
      html: accountEmail('Atur ulang kata sandi', `<p>Gunakan tautan berikut untuk membuat kata sandi baru untuk akun Samavaya kamu.</p>
    <p><a href="${resetHref}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#40573e;color:#fff;text-decoration:none">Atur ulang kata sandi</a></p>
    <p>Tautan berlaku selama 1 jam.</p>`),
    });
    if (error) throw error;
  } catch (error) {
    console.error('Gagal mengirim email reset password:', error);
    throw error;
  }
}

export async function sendPlannerInvitation(to, url) {
 if (!process.env.RESEND_API_KEY) throw new Error('Email belum dikonfigurasi');
 const {error}=await resend.emails.send({from: 'Samavaya <'+FROM_EMAIL+'>',to,subject:'Mari siapkan hari bahagia bersama',attachments:[brandMark],text:'Kamu diundang sebagai anggota Wedding Planner Samavaya. Buka '+url+' dan masuk dengan email ini. Berlaku 7 hari.',html:accountEmail('Siapkan bersama', '<p>Kamu diundang menjadi anggota Wedding Planner. Anggota dapat memperbarui persiapan; pengelolaan akses tetap milik pemilik.</p><p><a href="'+url+'">Terima undangan</a></p><p>Masuk menggunakan email penerima ini. Tautan berlaku 7 hari.</p>')});
 if(error)throw new Error('Pengiriman gagal');
}
