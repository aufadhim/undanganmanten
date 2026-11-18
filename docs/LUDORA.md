# Ludora — cheerful, engine 3

Template Immersia aktif, ID `ludora`. Buka `/sandbox?theme=ludora`. Tersedia di katalog, tema awal undangan, studio, backend preset, dan renderer publik yang sama.

## Arah visual

Terinspirasi dari foto prewed yang diperlihatkan pengguna: bermain gelembung di taman, berjalan berdua, pakaian navy, tangga dan plaza terracotta. Foto asli tidak disalin atau disebarkan sebagai aset contoh. Sampul dan hero kini memakai ilustrasi personal Aisyah & Auf versi 2 sesuai permintaan pengguna, dengan dua pose berbeda.

Dunia bergerak dari meadow → plaza → picnic → party. Satu panorama cat air dipakai sebagai dasar; empat potongan persegi saling bertumpang tindih dalam koordinat dunia yang sama. Ini menjaga kontinuitas arah jalan dan warna, bukan empat background yang berganti saat scroll. Dekorasi meadow dan pasangan berada di depth terpisah. Warna utama navy, terracotta, butter yellow, ivory, dan biru lembut.

Sampul memiliki gelembung sabun, kupu-kupu, kelopak dan cahaya. Efek hanya di sampul; pause saat dibuka/tab tersembunyi, dan mengikuti reduced motion. Ritme kamera mengikuti standar engine 3, termasuk kembali langsung ke sampul.

## File edit

- `frontend/public/templates/ludora/landscape.css`: warna, tombol, dan override tampilan.
- `frontend/public/templates/ludora/landscape.json`: area, koordinat kamera, pasangan, dan depth dekorasi.
- `frontend/src/components/templates/ludora/defaultConfig.json`: aset, teks default, ukuran/posisi awal. Harus sama dengan `frontend/public/templates/ludora/config/invitation.json`.
- `frontend/src/components/templates/ludora/LudoraTemplate.jsx`: wrapper studio/publik.
- `frontend/public/templates/shared/cover-ambience.js` profil `ludora`: jumlah gelembung dan ornamen.
- `frontend/public/templates/ludora/assets/`: seluruh aset visual khusus tema, WebP mobile. Musik dan komponen konten tetap menggunakan komponen bersama.

Konten asli pengguna tetap dari editor. Ukuran teks per bagian, font global, urutan blok, galeri/lightbox, dress code, livestream, bingkai, hadiah, RSVP/ucapan, musik, dan posisi pasangan memakai dukungan Immersia yang sama. Filter/bingkai tidak dinyalakan secara default.

## Aset dan sumber

Dibuat dengan **built-in Imagegen**; hasil terpilih dikompresi ke WebP dan disimpan dalam folder assets di atas. Tidak memakai API key pengguna dan tidak ada generator AI baru di produk.

- `park-world.webp`: panorama asli 2172 × 724; empat `landscape-*.webp` adalah potongan 724 × 724. `thumbnail.webp` adalah turunan katalog.
- `couple-sampul-v2.webp` dan `couple-hero-v2.webp`: cutout alpha 1024 × 1536; pose saling pandang untuk sampul, pose bersandar untuk hero dan penutup. Berkas sumber ada di `output/ludora-personal/`.
- `meadow.webp`: foreground bunga alpha 1000 × 334.
- `contact-shadow.svg`: bayangan kontak ringan dari bentuk radial, untuk kaki di penutup.
- `/assets/photo-frames/ludora.svg`: turunan sistem bingkai SVG proyek, warna coral/butter/powder blue.

Prompt final pembuatan bitmap tercatat di `LUDORA_ART_PROMPTS.md`.

## Verifikasi

109 tes frontend berhasil, termasuk registrasi Ludora, sinkronisasi pack/preset backend, batas kamera HP/desktop, lintasan panjang, ukuran karakter, serta gelembung sampul. Tes backend preset dan kewenangan admin juga berhasil. Build production berhasil. Pemeriksaan browser: sampul/hero, countdown/plaza, galeri, penutup, preview HP dan desktop; fallback Canvas 2D juga menampilkan semua ilustrasi. Fixture: `/tests/fixtures/landscape-engine-check.html?theme=ludora&renderer=canvas`.

## Kalibrasi skala 1 November 2026

Bidang lingkungan diperkecil dari 14.400 ke 7.200 unit per potongan. Dunia 21.600 × 7.200 dengan origin vertikal -1.200. Posisi underpainting dan batas kamera memakai origin yang sama. Pasangan dipindahkan ke depth -1.800, dekat latar -2.200, dengan ukuran fisik yang disesuaikan; rasio pasangan terhadap benda latar tidak lagi berubah drastis ketika kamera mundur. Foreground meadow juga dipindahkan dan diperkecil, bayangan kontak mengikuti kaki serta opacity karakter. Penutup default 90% untuk Ludora; tema lain tetap 72%. Ukuran di editor, pack, dan baseline penutup mengikuti nilai yang sama.

110 tes frontend lulus, termasuk regresi rasio perspektif, ukuran topi terhadap manusia, batas kamera sepanjang lintasan, dan pembedaan aset sampul/hero.

Penutup memakai susunan teks yang lebih ringkas dan sapuan ivory yang dibatasi ke area teks, sehingga wajah pasangan di bawahnya tidak tertutup. Sampul 1.200 unit, hero 1.250 unit; skala penutup tetap 90% dengan baseline kaki yang dikalibrasi ulang.

### Koreksi penutup 1 November 2026
Skala default pasangan penutup dinaikkan dari 0.9 menjadi 1.25 terhadap heroWidth. Titik lantai tetap memakai baseline width 1125 pada map sehingga ukuran berubah ke atas, bukan kaki turun/terbang. Editor reset mengikuti default yang sama. Panel teks diringkas ke bagian atas agar tidak menutup wajah. Regression memeriksa rasio tinggi dewasa terhadap sepeda dan konsistensi anchor kaki. Diperiksa visual pada preview HP 390×844.
