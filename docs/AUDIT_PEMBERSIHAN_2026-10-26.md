# Audit & pembersihan UndanganManten — 26 Oktober 2026

## Kesimpulan

Ada tumpukan aset eksperimen/tema lama, referensi desain unduhan, dan kode lama yang tidak lagi diimpor aplikasi. Pembersihan tahap ini mengurangi aset publik **83,69 MiB (29,47%)** tanpa mengganti desain atau alur bisnis. Perombakan produk belum dilakukan.

Salinan kerja utama untuk chat ini adalah `/Users/auf/Documents/ChatGPT/undanganmanten`. Folder tersebut awalnya kosong. Sumber diambil dari `/Users/auf/Projects/undanganmanten` beserta riwayat Git dan semua perubahan kerja yang belum di-commit; sumber asli tidak diubah dan menjadi cadangan pemulihan.

## Ukuran terukur

| Bagian | Sebelum | Sesudah | Selisih |
|---|---:|---:|---:|
| Aset publik | 283,96 MiB / 671 berkas | 200,27 MiB / 366 berkas | −83,69 MiB / 305 berkas |
| Hasil build produksi | 287,51 MiB | 203,82 MiB | −83,69 MiB |
| Semua berkas yang dikeluarkan dari salinan | — | 798 berkas | 222,99 MiB |
| Source lama yang dihapus | — | 21 berkas | komponen/utilitas/CSS yang tidak terhubung |
| Precache PWA saat build | 85 entri / 2907 KiB | 82 entri / 2324 KiB | 3 aset SVG mati ikut keluar |

MiB = 1.048.576 byte. Angka aset/build bukan jumlah yang pasti diunduh dalam satu kunjungan. Browser memuat aset sesuai tema, cache, dan lazy loading. Ukuran awal seluruh folder sumber sekitar 1,4 GB juga mencakup dependensi, build lama, referensi unduhan dan riwayat Git.

Dependensi terpasang, hasil build, hasil tes browser dan cache Python tidak dibawa sebagai isi permanen folder kerja. Dependensi sementara untuk verifikasi ditempatkan di `/private/tmp`, bukan diduplikasi ke sumber. Build setelah verifikasi dibersihkan kembali; jalankan build ulang bila memerlukannya. Riwayat Git tetap dipertahankan.

## Yang dibersihkan

- Folder aset tema yang tidak dipakai runtime aktif: `nisera`, `samaya`, `ornamen` generik dan `daguerre` (hanya tersisa referensi pada koleksi draft Atelier yang tidak diimpor aplikasi).
- Berkas sisa iterasi di Lanqing, Edena, Nocturne, Eternal, Isvara, Yunshui dan Nawasena yang tidak memiliki pemakai setelah peninjauan pemanggilan dinamis.
- `contoh template/`: referensi desain unduhan, sudah diabaikan Git dan bukan bagian aplikasi. Salinannya masih tersedia di proyek asal.
- 21 source lama: stylesheet tema yang tidak diimpor, dua stylesheet Yunshui lama, komponen AnimatedSection/Countdown/MapEmbed lama dan utilitas lama yang hanya digunakan komponen mati atau tidak punya pemakai.
- Dependensi langsung `aos` dan `react-frame-component` beserta entri lockfile/transitif yang dilepas npm. Tidak ada impor keduanya di source. `@fortawesome/fontawesome-svg-core` tetap dipertahankan karena merupakan bagian rantai peer Font Awesome React.

Daftar persis per berkas, ukuran, alasan dan SHA-256 ada di `audit/cleanup-manifest.json`. Tidak ada penghapusan akun, basis data, R2, deployment, atau konten pelanggan.

## Yang sengaja dipertahankan

- Sembilan template aktif: Eternal, Seraya, Nawasena, Isvara, Lanqing, Celluloid, Nocturne, Edena, Yunshui.
- Ornamen Nawasena yang namanya dibentuk dari nomor saat runtime; pencarian nama lengkap saja salah menganggapnya tidak dipakai.
- Thumbnail yang ditentukan oleh ID tema secara dinamis.
- Kontrak/blueprint Atelier yang masih dibaca quality gate meskipun bukan template publik aktif. Enam modul yang masih ditandai di luar graf runtime mencakup kontrak/test/design draft dan konfigurasi build; itu bukan alasan otomatis untuk menghapusnya.
- Backend, skema Prisma, pembayaran, autentikasi, upload, RSVP, ucapan, entitlement, serta data/config lokal yang sudah ada. Seluruh perubahan pengguna sebelum audit dipertahankan.

## Temuan untuk perombakan selanjutnya

### 1. Aset aktif tetap besar

Tiga folder terbesar setelah pembersihan: Lanqing **90,92 MiB**, Edena **41,43 MiB**, Nocturne **27,25 MiB**; gabungan sekitar 80% aset publik. Lanqing memuat latar PNG sekitar 5–7 MB per gambar dan banyak ornamen transparan beberapa MB. Edena memiliki sejumlah WebP sekitar 2–4 MB. Menghapus aset mati mengurangi paket deployment, tetapi kelancaran kamera juga tergantung decoding, dimensi tekstur, jumlah layer dan efek CSS.

Prioritas lanjutan: tetapkan resolusi maksimum mobile/desktop, turunan thumbnail, anggaran ukuran per ruang, encoding yang cocok untuk alpha, serta pemuatan bertahap. Audit ini tidak mengubah kualitas gambar aktif.

### 2. Registrasi template tersebar

Daftar tema/preset muncul di manifest template, `PhonePreview`, TemaPanel/SandboxTemaPanel, WarnaPanel/SandboxWarnaPanel, allowlist Dashboard/SandboxDashboard/activeTheme, preset backend dan tes. Membuat satu template masih membutuhkan sinkronisasi banyak titik. Belum ditemukan pipeline impor paket template otomatis pada alur ini.

Arah yang disarankan: satu kontrak manifest paket, registry yang dihasilkan dari manifest, pemisahan aset/desain dari data pelanggan, dan validasi paket sebelum aktivasi. Engine depth dan view model yang sudah ada tetap menjadi bahan yang dapat digunakan ulang.

### 3. Beberapa generasi engine dan tumpukan CSS

Ada template reguler, depth v1, depth v2, serta draft Atelier. Ini tidak semuanya sampah: engine berbeda masih melayani template aktif. Namun kontrak navigasi, safe area, buka sampul, scroll internal, portal/modal, reduced motion dan lifecycle media perlu disatukan ketika engine baru dipasang. CSS aktif juga panjang (contoh: Eternal 2360 baris, Lanqing 1753 baris), dengan jejak beberapa tahap refinement. Jangan meratakan desain dengan satu CSS global; pisahkan kontrak perilaku dan identitas visual.

### 4. PWA memuat kode lintas halaman

Workbox memakai glob JS/CSS/HTML/font seluruh build dengan sejumlah pengecualian. Setelah cleanup masih ada precache sekitar 2,27 MiB. Lazy chunk template/halaman lain dapat ikut diprecache; ini perlu dievaluasi agar halaman undangan tamu tidak membayar biaya seluruh dashboard/desain yang tidak digunakan. Jangan mengklaim semua 200 MiB diunduh saat halaman pertama dibuka.

### 5. Sebagian fixture tes browser sudah tertinggal

`templates-active.spec.js` masih berisi delapan tema dan ekspektasi tujuh item katalog, sementara runtime mempunyai sembilan tema. Sebagian fixture e2e lama masih memakai `samaya`. Tes tersebut perlu disesuaikan dengan kontrak/template aktif; menjalankannya sebagai satu-satunya gate saat ini dapat menghasilkan kegagalan yang tidak berkaitan dengan cleanup. Tes kelengkapan Node yang digunakan audit sudah memeriksa sembilan template.

## Verifikasi

- Sebelum dan sesudah: **15/15** tes kelengkapan template dan **28/28** tes backend lulus.
- Build produksi Vite + PWA lulus sebelum/sesudah, termasuk setelah perubahan dependensi.
- **85 URL aset literal** pada JS/CSS/HTML hasil build diperiksa: tidak ada berkas hilang.
- Sembilan template dipilih lewat Mode Coba pada browser lokal; tidak ditemukan gambar lokal rusak pada gambar yang selesai dimuat. Nocturne masih mempunyai 21 gambar lazy/offscreen yang tidak dipaksa dimuat; seluruh path lokal yang dideklarasikan pada DOM-nya juga diperiksa ada di disk.
- Pemulihan seluruh 798 berkas diuji dengan `--dry-run`: sumber asli tersedia dan hash cocok.
- Audit registry kerentanan npm daring, layanan eksternal (database/pembayaran/R2/email), seluruh jalur e2e, performa FPS dan regresi visual menyeluruh tidak dijalankan. Hasil ini bukan audit keamanan lengkap.

Artefak pemeriksaan ada di `docs/audit/`: inventaris sebelum/sesudah, manifest cleanup, metrik, hasil pemeriksaan browser/aset build, serta log build dan tes.

## Menjalankan ulang

```
npm --prefix frontend ci
npm --prefix backend ci
npm --prefix frontend run test:templates
npm --prefix backend test
npm --prefix frontend run build
python3 tools/audit/check-built-assets.py
python3 tools/audit/inventory.py
```

Perintah instalasi di atas untuk pemakaian berikutnya; audit ini menggunakan salinan dependensi terpasang yang sudah ada, tidak memasang ulang seluruh dependency tree dari jaringan.

## Memulihkan berkas cleanup

```
python3 tools/audit/restore.py --all --dry-run
python3 tools/audit/restore.py --path frontend/public/assets/edena/edena-pillar.webp
```

Untuk seluruh berkas gunakan `--all` tanpa `--dry-run`. Script tidak menimpa berkas yang sudah ada, dan menolak cadangan yang hash-nya berubah. Pemulihan mengandalkan folder proyek asal tetap tersedia; jangan hapus folder asal sebelum keputusan akhir perombakan.
