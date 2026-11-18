# Landing page cat air — 27 Oktober 2026

Landing page dibuat ulang dengan palet ivory/sage, taman cat air berlapis, dan contoh interaktif tiga adegan. Template undangan yang sudah ada tidak dirombak pada tahap ini.

## Sumber pengaturan

- `frontend/src/pages/Landing.jsx`: susunan halaman.
- `frontend/src/components/landing/landingContent.js`: teks Indonesia/Inggris, fitur, FAQ, dan harga.
- `frontend/src/components/landing/PaintedGarden.jsx`: lapisan ilustrasi dan gerakan kamera.
- `frontend/src/components/landing/canvas-landing.css`: tampilan dan penyesuaian HP.
- `frontend/public/assets/landing-canvas/`: enam gambar WebP, total sekitar 2,30 MiB. Gambar awal hero sekitar 1,28 MiB.

Ilustrasi menggunakan kembali aset cat air yang sudah dioptimalkan. Studi suasana pada halaman merupakan eksplorasi visual, bukan tambahan template yang sudah tersedia.

## Pemeriksaan

Build berhasil; 15 tes template dan 28 tes backend lulus. Pemeriksaan aset hasil build tidak menemukan URL yang hilang. Menu HP, bahasa, FAQ, tombol Mode Coba, serta contoh tiga adegan diperiksa melalui browser. Lebar 360 dan 390 piksel tidak melebar horizontal. Animasi berhenti dirender saat keluar viewport, dan renderer dibersihkan saat meninggalkan halaman.

Bukti pemeriksaan berada di `docs/landing/`, termasuk screenshot desktop dan HP. Belum dipublikasikan ke hosting.
