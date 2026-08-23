# UndanganManten

SaaS undangan pernikahan digital dengan React/Vite pada frontend dan Express/Prisma/PostgreSQL pada backend.

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
