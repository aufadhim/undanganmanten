# UndanganManten

SaaS undangan pernikahan digital dengan React/Vite pada frontend dan Express/Prisma/PostgreSQL pada backend.

## Fitur utama

- Dashboard multi-undangan, editor tema, profil, acara, galeri, tamu, RSVP, dan ucapan.
- Halaman undangan publik dengan personalisasi tamu dan QR check-in.
- Trial 2 hari, paket Standard/Premium, add-on, dan pembayaran Midtrans.
- Email OTP, login Google opsional, lupa password, admin, serta penyimpanan media Cloudflare R2.

## Environment

Konfigurasi development dan production tidak lagi ditulis langsung di kode. Salin contoh environment berikut lalu isi nilainya:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.development
```

Untuk production, gunakan environment variable dari platform deployment. Jangan menyimpan `.env` atau secret ke repository.

Nilai penting production:

- `NODE_ENV=production`
- `FRONTEND_URL=https://domain-frontend`
- `BACKEND_URL=https://domain-api`
- `VITE_API_BASE_URL=https://domain-api/api`
- `VITE_BACKEND_URL=https://domain-api`
- `MIDTRANS_IS_PRODUCTION=true` hanya ketika production key sudah tersedia

## Menjalankan development

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Build production

```bash
cd frontend && npm run build
cd backend && npm start
```

Backend akan menolak start production jika `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, atau `BACKEND_URL` belum tersedia.

## Verifikasi lokal

```bash
npm test
npm run build
npm run audit
cd frontend && npm run test:e2e -- --list
```

Test E2E lengkap memakai database terpisah melalui `TEST_DATABASE_URL`; jangan arahkan ke database development atau production. CI GitHub sudah menyiapkan PostgreSQL sementara untuk alur tersebut.

## Deployment

- Backend: build dari `backend/Dockerfile`; container menjalankan `prisma migrate deploy` lalu server.
- Frontend: build dari `frontend/Dockerfile`; hasil SPA disajikan Nginx dengan cache aset dan fallback route.
- Health liveness tersedia di `/health`, sedangkan readiness database tersedia di `/ready`.
- Isi semua secret dari secret manager platform, bukan dari file yang di-commit.

Urutan dan pemeriksaan produksi lengkap tersedia di [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).
