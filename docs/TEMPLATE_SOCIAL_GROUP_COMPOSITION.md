# Cerita, galeri, dress code, livestream, dan bingkai foto

Tahap authoring untuk 34 template baru (11 engine 1, 12 engine 2, 11 engine 3). Tidak menjalankan testing, build, atau pemeriksaan browser. Belum didaftarkan ke katalog.

Kelima bagian memakai satu kelompok ruang dengan perpindahan lokal 4,2 detik. Engine 1/2 memakai koordinat berdekatan dalam ruang 3; engine 3 mempertahankan perjalanan panorama antararea dan memakai stop berdekatan dalam area cerita. Pengaturan opsional `composition.social` tidak mengubah koreografi template lama.

## Komposisi

- Judul bagian 34 px, 29 px pada layar pendek, 38 px pada layar lebar. Label dan isi 11 px. Sapuan ivory tetap memakai komponen bersama sebagai alas baca, tanpa kartu putih tambahan.
- Cerita memakai komponen bab dan animasi sebelumnya/berikutnya yang sudah ada. Judul bab 26 px; teks panjang dapat digulir dalam panel.
- Galeri mendapat hampir seluruh lebar layar. Enam layout dan lightbox bersama tetap dipakai; video memiliki jalur horizontal sendiri selebar galeri. Slideshow tetap memakai navigasi horizontal. Area foto memiliki tinggi pasti agar penghitungan tata letak dapat bekerja.
- Dress code memakai renderer bersama, termasuk kelompok pakaian, warna, label dan catatan. Warna tidak diganti dengan palet dekoratif template karena mengikuti isi pengguna.
- Livestream memakai poster dan pemutar/lightbox bersama. Bingkai foto memakai komponen unggah foto dan unduh hasil yang sudah ada. Modal tidak dipotong oleh panel baca.
- Status aktif/nonaktif, isi, unggahan, dan urutan bagian tetap mengikuti editor. Tidak mengaktifkan bingkai foto secara otomatis.

## Pengubahan

CSS: `frontend/public/templates/<folder>/social-composition.css`.
Konfigurasi: `composition.social` dan `cameras` pada kedua salinan konfigurasi masing-masing template. Engine 3 juga memakai `landscape.json`.
Script authoring: `tools/apply-template-social-compositions.mjs`.
Koreografi bersama: `frontend/public/templates/shared/event-group-journey.js` menerima daftar ID kelompok opsional; lintasan engine tetap menggunakan interpolasi bersama.

Tahap berikutnya: hadiah, RSVP/ucapan, dan penutup. Hasil tahap ini masih perlu pemeriksaan visual bersama setelah kelompok siap.
