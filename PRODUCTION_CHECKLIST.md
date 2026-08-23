# Checklist Production UndanganManten

## Infrastruktur

- Gunakan PostgreSQL terkelola dengan backup otomatis dan SSL.
- Buat bucket Cloudflare R2 dan domain publik media.
- Deploy `backend/Dockerfile` dan arahkan healthcheck ke `/ready`.
- Deploy `frontend/Dockerfile` setelah domain API final diketahui.
- Gunakan HTTPS untuk frontend, API, dan media.

## Secret dan layanan

- Buat `JWT_SECRET` acak minimal 32 karakter.
- Isi kredensial PostgreSQL, R2, Resend, dan Midtrans pada secret manager hosting.
- Verifikasi domain pengirim di Resend.
- Daftarkan URL frontend pada Google OAuth jika Google Login digunakan.
- Daftarkan webhook Midtrans: `https://DOMAIN_API/api/payments/webhook`.
- Pastikan mode dan client/server key Midtrans sama-sama sandbox atau sama-sama production.

## Database

- Ambil backup sebelum migrasi pertama.
- Jalankan `npx prisma migrate deploy`; entrypoint backend container menjalankannya otomatis.
- Pastikan `/ready` mengembalikan HTTP 200 setelah deployment.

## Verifikasi bisnis

- Daftar, OTP email, login, lupa password, dan reset password.
- Buat undangan dan edit semua panel utama.
- Upload foto, musik, dan galeri ke R2.
- Buka undangan publik dengan dan tanpa tautan tamu.
- RSVP, ucapan, QR check-in, dan ekspor tamu.
- Pembayaran sandbox end-to-end termasuk webhook sebelum mengaktifkan production.
- Uji akun admin dan pastikan akun user biasa ditolak oleh endpoint admin.

## Sebelum membuka akses publik

- Jalankan `npm test`, `npm run build`, dan `npm run audit` dari root.
- Konfirmasi Terms, Privacy, harga paket, masa aktif, dan kebijakan penghapusan akun.
- Aktifkan monitoring uptime untuk `/health` dan `/ready`.
- Simpan prosedur rollback image/container versi sebelumnya.
