# Hadiah, RSVP/ucapan, dan penutup

Authoring tiga bagian terakhir telah diterapkan pada 34 template baru (11 engine 1, 12 engine 2, 11 engine 3). Belum menjalankan testing, build, atau browser QA sesuai arahan pengerjaan bertahap. Belum diaktifkan dalam katalog.

- Hadiah tetap memakai GiftDetails bersama: rekening dan alamat dibuka setelah tamu memilihnya, tanpa menampilkan detail sejak awal. Panel hadiah boleh menggulir saat detail panjang; tombol ivory ringkas dan angka rekening dapat disalin.
- RSVP dan ucapan tetap memakai PublicForms/GuestConfirmation bersama, tanpa menambah kolom WA. Judul dan subtitle tetap terlihat di atas form. Satu ruang gulir hampir setinggi layar menampung form dan daftar ucapan; daftar ucapan tidak memiliki gulir bersarang. Perilaku validasi, identitas tamu, dan penyimpanan tidak diganti.
- Penutup menempatkan teks di atas, tanggal menggunakan nama bulan, dan tautan brand UndanganManten tetap memakai bridge bersama.
- Engine 1 dan 3 menggunakan ulang ilustrasi hero; tidak menambah aset. Lebar karakter dihitung dari batas alpha yang sudah dicatat, target tinggi tubuh 43% layar dan kaki pada 92% tinggi layar referensi 390 × 844. Ini komposisi awal; skala terhadap objek pada lukisan masih perlu dinilai saat pemeriksaan visual.
- Engine 2 mempertahankan penutup di ruang luar buku bersama cover, termasuk animasi keluar buku. Tidak memaksakan penempatan karakter dalam ruang internal ke adegan luar buku.
- Perpindahan lokal kelompok akhir 4,2 detik melalui pengaturan opsional `composition.finale`. Engine 3 tetap mempertahankan jalur panorama antararea. Tombol kembali ke sampul tetap mengikuti engine masing-masing.

## Lokasi edit

Tampilan: `frontend/public/templates/<folder>/final-composition.css`.
Data/kamera: `frontend/public/templates/<folder>/config/invitation.json` dan `frontend/src/components/templates/<folder>/defaultConfig.json`.
Landscape: `frontend/public/templates/<folder>/landscape.json`.
Script authoring: `tools/apply-template-final-compositions.mjs`.
Rekap penempatan: `output/template-composition/final-placements.json`.

Seluruh kelompok bagian kini sudah ditulis. Langkah berikutnya adalah penyambungan katalog/pratinjau dan pemeriksaan bersama, setelah mendapat arahan tahap berikutnya. Status authored tidak berarti hasil telah lolos pemeriksaan visual.
