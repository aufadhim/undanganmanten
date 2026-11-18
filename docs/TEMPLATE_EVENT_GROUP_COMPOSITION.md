# Komposisi countdown, acara, dan rundown

Tahap authoring ini mencakup 34 template baru: 11 engine 1, 12 engine 2, dan 11 engine 3. Belum dilakukan testing, build, atau pemeriksaan browser sesuai alur pengerjaan bertahap. Template belum didaftarkan ke katalog maupun diaktifkan.

## Tampilan

- Countdown memakai komponen SaveTheDate bersama: angka 42 px (36 px pada layar pendek), label 11 px, judul bulan kalender 18 px. Kalender tidak dibuat ulang.
- Akad dan resepsi memakai renderEventDetails bersama. Jika nama tempat, alamat, dan tautan Maps sama, lokasi ditampilkan sekali di bawah dua jadwal. Jika berbeda, detail lokasi mengikuti kolom masing-masing.
- Subjudul acara 24 px dengan kapitalisasi normal; jam 13 px; keterangan 11 px. Tautan lokasi dan simpan tanggal memakai tombol ivory berbingkai tipis tanpa ikon tambahan.
- Jam dan nama kegiatan rundown sama-sama 13 px; deskripsi 11 px. Urutan tetap mengikuti susunan editor.
- Panel memakai sapuan ivory bersama. Panel panjang dapat digulir agar isi tetap dapat diakses pada layar pendek.

## Perjalanan kamera

Engine 1 dan 2 memakai satu ruang acara untuk ketiga bagian. Gerakan lokal 4 detik, masuk 6,2 detik dan keluar 5,4 detik. Perjalanan dari kelompok profil kembali melewati komposisi pasangan sebelum berpindah ruang. Perubahan latar mengikuti tahap gerakan, bukan langsung mengganti latar di awal.

Engine 3 mempertahankan jalur panorama untuk perpindahan antararea. Ketiga stop acara berada dalam satu area yang sama dengan selisih koordinat kecil; perpindahan lokal memakai durasi 4 detik.

Pengaturan ini bersifat opsional melalui `composition.events`, sehingga template lama tidak otomatis memakai koreografi baru.

## Lokasi pengubahan

- Tampilan tiap template: `frontend/public/templates/<folder>/event-composition.css`.
- Konfigurasi: `frontend/public/templates/<folder>/config/invitation.json` dan salinannya di `frontend/src/components/templates/<folder>/defaultConfig.json`.
- Kamera engine 1/2: properti `cameras` pada konfigurasi.
- Stop engine 3: `frontend/public/templates/<folder>/landscape.json`.
- Koreografi bersama: `frontend/public/templates/shared/event-group-journey.js`.
- Pembentukan konfigurasi dan CSS seluruh kelompok: `tools/apply-template-event-compositions.mjs`.
- Rekap hasil authoring: `output/template-composition/event-placements.json`.

Kelompok cerita cinta, galeri, dress code, livestream, dan bingkai foto sudah diatur; lihat `TEMPLATE_SOCIAL_GROUP_COMPOSITION.md`. Pemeriksaan visual dilakukan setelah kelompok yang disepakati siap.
