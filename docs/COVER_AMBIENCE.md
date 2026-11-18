# Sampul aktif: entrance dan ambient motion

Acuan gerak: https://id.pinterest.com/pin/1020206121859281146/

Prinsipnya adalah beberapa lapisan yang bergerak bersamaan, bukan memutar video di belakang teks. Adegan pembuka dimulai setelah gambar utama, ornamen, stylesheet, dan font siap (font memakai fallback setelah 1,8 detik). Setelah entrance selesai, gerakan kecil tetap berjalan. Tombol buka tetap memakai navigasi dan musik yang sama.

| Template | Arah cover |
| --- | --- |
| Viridarium | Curtain daun dan kupu-kupu asli dipertahankan; ditambah cahaya, kelopak, dan butiran cahaya. |
| Sogan | Panggung 3D tetap; melati di tepi bergerak, kelopak hangat dan burung melintas. |
| Pramaya | Buku dan portal tetap; melati, kupu-kupu, cahaya lembut, kelopak. |
| Riviera | Establishing shot, kamera bernapas/parallax, bunga di tepi membuka, burung, kupu-kupu, kelopak. |
| Wasesa | Establishing shot, kamera bernapas/parallax, kanopi melati, kelopak, cahaya; burung Wasesa yang sudah ada dipertahankan. |
| Eternal | Kain di tepi, sapuan cahaya, kupu-kupu monokrom, kelopak ivory. |
| Seraya | Lipatan kertas, cahaya hangat, potongan kertas bergerak; gaya editorial dipertahankan. |
| Nawasena | Sudah memiliki bunga, burung dan entrance sendiri; tidak ditumpuk efek yang sama. |

## Maintenance

- `frontend/public/templates/shared/cover-ambience.js`: profil tema, jumlah/tempo elemen, preload, pause dan cleanup.
- `frontend/public/templates/shared/cover-ambience.css`: entrance, gerakan loop dan palet setiap tema.
- `frontend/public/templates/mental-canvas-3/cover-motion.js`: establishing shot 6 detik dan drift/parallax kamera engine 3.
- `frontend/src/components/templates/shared/CoverAmbience.jsx`: adapter React untuk Signature.
- `frontend/public/templates/shared/assets/cover-*.webp`: turunan ringan dari ornamen milik proyek; tidak membuat undangan bergantung pada gambar Pinterest.

Sumber gambar: botanical-spray Viridarium, jasmine-canopy-dusty Sogan, butterfly Yunshui, serta sprite burung Wasesa. Rasio gambar dijaga; sudut frame memakai potongan berasio asli dan tepi mask lembut. Tiga turunan ornamen bersama total sekitar 196 KB, dipakai ulang lintas template.

Semua elemen dekoratif memakai `aria-hidden` dan tidak menangkap klik. Loop dipause saat sampul ditutup atau tab tersembunyi. Reduced motion menonaktifkan dekorasi bergerak dan memakai kamera diam. Kembali ke sampul engine 3 tetap memakai perjalanan langsung 1,6 detik dan tidak mengulang establishing shot.

Verifikasi otomatis: profil delapan tema, kesiapan aset sebelum entrance, pause/resume, cleanup React, late completion setelah unmount, dan kontinuitas kamera/reduced motion. Fixture lintas tema: `frontend/tests/fixtures/cover-ambience-check.html`.
