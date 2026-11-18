# Pramaya — Mental Canvas 2

Tema Prambanan dengan palet warm stone, dusty terracotta, muted sage, antique gold dan dusty mauve. Enam ilustrasi baru dari built-in image_gen; dua pose pasangan, kanopi, tekstur alas dan musik memakai asset bersama yang sudah tersedia.

## Alur
Sampul dan penutup berada di ruang luar yang sama. Open Invitation memperbesar halaman kanan buku sampai memenuhi layar. Empat ruang isi memakai navigasi kamera dan hide/reveal konten. Menuju penutup, snapshot ruang aktif menyusut kembali menjadi ilustrasi di buku. Navigasi balik dari penutup memasuki buku lagi; tombol kembali ke sampul menjalankan gerak kamera pendek sebelum memunculkan UI sampul.

## File yang diedit
- Engine reusable: `frontend/public/templates/mental-canvas-2/`.
- Portal dan transisi: `book-portal.js`; durasi enter 4400 ms, exit 4600 ms, return 1800 ms.
- Geometry: `portal-math.js` dan `portal.css` (posisi halaman kanan `.book-page`).
- Navigasi internal: `hero-scene.js`; rendering GPU: `scene-engine.js`.
- Tema, font, ukuran, warna: `frontend/public/templates/pramaya/custom.css`.
- Konfigurasi tema induk: `frontend/src/components/templates/pramaya/defaultConfig.json`.
- Konfigurasi runtime: `frontend/public/templates/pramaya/config/invitation.json`.
- Gambar: `frontend/public/templates/pramaya/assets/`.
- Wrapper data UndanganManten: `frontend/src/components/templates/pramaya/PramayaTemplate.jsx`, memakai adapter dan host bridge bersama.

Snapshot dibuat setelah ukuran stage siap, sesudah decode asset. Engine 2 memakai drawing buffer yang dipertahankan untuk transfer gambar WebGL ke halaman buku; engine 1 tidak diubah. Tidak ada snapshot atau data tamu yang diunggah. Semua snapshot ada di memori browser. Reduced motion memakai transisi 220 ms. Cover dan footer tetap wajib; bagian internal mengikuti toggle fitur host.

## Validasi
24 tes frontend dan 29 backend lolos. Tes geometri memeriksa tepian halaman tepat memenuhi viewport HP dan desktop, konfigurasi diverifikasi dengan validator dan preset backend, semua asset diperiksa. Build dan pemeriksaan URL asset berhasil. Pratinjau browser: cover, enter, navigasi lintas ruang, simulasi RSVP, exit, reverse entry dan penutup.

Asset baru: 6 WebP, total 1.58 MiB. Gambar latar maksimal 960×1440, buku maksimal 1200×800. Prompt dan sumber disimpan di `prompts.json`.


## Revisi portal perspektif WebGL

Transisi memakai `book-portal-renderer.js`: latar pada kedalaman -120, buku pada 0, ilustrasi halaman pada 0.01. Satu kamera perspektif bergerak lateral menuju pusat halaman lalu mendekat dengan jarak z, tanpa scaleX/scaleY berbeda. Latar berparalaks terhadap buku. Kamera menggunakan easing quintic dan pembesaran eksponensial. UV ilustrasi dibingkai ulang dengan rasio tetap menjelang akhir agar gambar di halaman menyambung tepat ke renderer interior tanpa menarik wajah atau buku. Gerakan keluar membalik parameter yang sama. Ini bidang ilustrasi 3D berlapis, bukan simulasi membuka lembar buku.

`portal-math.js` mengatur lintasan dan pembingkaian; `book-portal-renderer.js` mengatur rendering GPU. Cadangan tanpa WebGL juga memakai satu skala proporsional. Tes menguji rasio buku dan gambar pada enam titik lintasan di tiga rasio layar, serta kecocokan ukuran gambar pada endpoint. Pratinjau browser mengonfirmasi renderer `webgl-perspective`, masuk dan keluar, tanpa error console.
