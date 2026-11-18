# Optimasi aset untuk HP — 27 Oktober 2026

Seluruh raster aktif di salinan kerja undanganmanten dan paket Mental Canvas telah diproses. Gambar terpotong/crop tidak dilakukan: rasio dipertahankan, gambar kecil tidak diperbesar, dan transparansi tetap ada. Gambar kecil yang hasil kompresinya justru lebih besar dipertahankan versi sebelumnya.

## Hasil

| Kelompok | Sebelum | Sesudah |
|---|---:|---:|
| Seluruh aset publik undanganmanten, termasuk video contoh | 200,27 MiB | 43,27 MiB |
| Gambar raster undanganmanten | 196,64 MiB | 40,92 MiB |
| Aset Mental Canvas yang dipakai, termasuk musik | 30,17 MiB | 4,79 MiB |
| Gambar Mental Canvas | 28,15 MiB | 4,24 MiB |
| Delapan awan Mental Canvas | 15,25 MiB | sekitar 0,94 MiB |
| Ilustrasi Lanqing | 90,92 MiB | 7,47 MiB |
| Ilustrasi Edena | 41,43 MiB | 4,54 MiB |
| Ilustrasi Nocturne | 27,25 MiB | 4,72 MiB |

MiB dihitung dari ukuran berkas. Ini ukuran seluruh aset, bukan transfer per kunjungan atau hasil pengukuran FPS. File/font/script dashboard berada di luar angka gambar. Sumber gambar resolusi penuh tetap tersedia di proyek asal; pengoptimalan tidak dipublikasikan ke layanan produksi.

## Kebijakan

- WebP kualitas 86 untuk latar dan 84 untuk ilustrasi/lapisan, alphaQuality 100.
- Sisi terpanjang maksimal 1600 px untuk latar, 1400 px untuk pasangan/lapisan, 1200 px untuk ilustrasi lain, 1000 px untuk awan, dan 640 px untuk thumbnail.
- Logo/favicon tetap PNG, maksimal 512 px. Tidak semua gambar diubah ke satu ukuran karena luas tampilan dan kebutuhan zoom berbeda.
- Latar Lanqing 2160×3840 menjadi 900×1600, dan latar landscape 3840×2160 menjadi 1600×900. Ada cadangan untuk layar retina dan zoom sedang; tidak dijamin tetap sama tajam pada zoom ekstrem/fullscreen besar.
- Musik contoh Mental Canvas 48 detik: WAV 2,02 MiB menjadi MP3 96 kbit/s sekitar 0,55 MiB.
- Video contoh 25,48 detik: 1280×720 / 3,62 MiB menjadi 960×540 / 2,34 MiB, H.264 CRF26, MP4 faststart. Ini video demo bawaan, bukan upload pelanggan.
- SVG dipertahankan sebagai vektor. Unggahan pelanggan dan data basis data tidak diubah.

## Referensi dan kompatibilitas

57 nama gambar PNG/JPG bermigrasi ke WebP di undanganmanten. Referensi pada 11 source diperbarui, termasuk pembentukan nama ornamen Lanqing secara dinamis. File lama tidak diduplikasi ke public. Pemetaan lengkap ada di `optimization/reference-updates.json`.

Untuk deployment berikutnya, bila ada data pelanggan di database atau tautan lama yang menyimpan URL aset bawaan PNG/JPG, gunakan pemetaan itu untuk migrasi/alias. Audit lokal tidak membaca seluruh isi database pelanggan. Jangan menganggap perubahan URL otomatis memperbarui data eksternal. Tidak ada deploy produksi dalam pekerjaan ini.

Paket Mental Canvas mobile tersedia di `output/garden-canvas-mobile/` dan `output/garden-canvas-mobile.zip`. Ini salinan bahan template yang dioptimalkan, belum diimpor menjadi template React undanganmanten. Paket sumber lama tidak diubah. Delapan aset versi lama yang tidak dipakai tidak disertakan.

## Verifikasi

- 365 raster undanganmanten + 16 raster Mental Canvas: **381 gambar** berhasil didekode; dimensi, rasio, checksum hasil dan alpha diverifikasi.
- Hash sumber asli dari seluruh gambar cocok dengan berkas cadangan di folder proyek asal.
- **15 tes template + 28 tes backend lulus**, build Vite/PWA berhasil, dan 85 URL aset literal hasil build tidak memiliki berkas hilang.
- Sembilan template dipilih di Mode Coba browser. Tidak ada gambar lokal rusak yang terdeteksi; 21 gambar Nocturne masih lazy/offscreen dan tidak dipaksa memuat, tetapi semua path lokal DOM juga diperiksa ada di disk.
- Mental Canvas diperiksa pada viewport **390×844**, termasuk awan/kutipan setelah sampul dibuka. Pemeriksaan visual ini bukan uji semua breakpoint atau semua tingkat zoom.
- Konfigurasi dan ZIP Mental Canvas juga lolos pemeriksaan.

Artefak rinci ada pada `docs/optimization/`: manifest gambar sebelum/sesudah dengan SHA-256, perubahan referensi, hasil media, summary, log tes/build, dan hasil browser. `tools/assets/optimize-images.mjs` memakai sharp yang sudah terdaftar pada backend. Pemanggilan ulang dengan manifest yang sama melewati gambar yang hash hasilnya sudah sesuai, untuk menghindari kompresi lossy berulang pada gambar yang tidak berubah.

```
node tools/assets/verify-images.mjs
npm --prefix frontend run test:templates
npm --prefix backend test
npm --prefix frontend run build
npm run check:assets
```

Dependensi harus terpasang terlebih dahulu. Manifest di atas ditujukan untuk file kerja hasil optimasi saat ini; perubahan aset berikutnya memerlukan pencatatan/manifest baru.
