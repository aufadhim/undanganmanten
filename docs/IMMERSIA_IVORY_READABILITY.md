# Immersia — keterbacaan dan sapuan ivory

3 November 2026. Berlaku pada 40 template Immersia. Pemeriksaan visual tiap template tetap dilakukan pemilik proyek.

## Perubahan

- Satu lapisan pigment untuk setiap area baca. Panel tidak menambahkan card putih kedua. Sapuan penutup engine 1/2 yang sebelumnya sengaja dipadamkan kini ikut tampil.
- Geometri berdasarkan gabungan kotak teks dan kontrol yang terlihat, bukan seluruh padding atau tinggi scroll panel. Konten yang berada di luar area scroll tidak memperbesar sapuan. Foto/video galeri dikecualikan dari area yang diputihkan.
- Margin 16 px horizontal dan 20 px vertikal di sekitar konten, feather 8/10 px, blur 6 px. Warna ivory tetap senada dengan Viridarium, bagian inti lebih stabil (.88–.94 alpha) alih-alih memudar tepat di bawah ujung teks.
- Sapuan judul sampul/hero dan salam tamu memakai pengukuran konten yang sama. Tidak lagi mengikuti lebar penuh kontainer hero.
- Ukuran dihitung ulang saat konten, font, viewport, atau area scroll berubah. Pengukuran digabung satu kali per frame saat ada perubahan; tidak dilakukan setiap frame animasi kamera.
- Semua entry template memuat stylesheet canonical paling akhir agar aturan lokal lama tidak mengubah opacity/mask kembali. Teks kecil menggunakan tinta tema yang sedikit diperkuat; heading besar tetap memakai karakter palet tema.

## File utama

- `frontend/public/templates/shared/ivory-wash.css`: warna, inti, feather, blur, dan aturan teks.
- `frontend/public/templates/shared/ivory-wash.js`: pengukuran dan pembaruan area baca.
- `frontend/public/templates/shared/runtime/cloud-backdrops.js`: penghubung engine 1/2.
- `frontend/public/templates/engines/landscape/reading-washes.js`: penghubung engine 3.

## Validasi terarah

`node --test frontend/tests/ivory-readability.test.js frontend/tests/landscape-washes.test.js`

5 pengujian lolos: batas konten/scroll, kesamaan geometri ketiga engine, resize/reveal, satu stylesheet terakhir di 40 template, dan kontras tinta isi >=4.5:1 dalam simulasi sapuan efektif 80% pada latar hitam. Simulasi tersebut bukan pengukuran screenshot atau jaminan kontras setiap piksel pada tepi blur. Hasil visual lukisan dan sapuan tetap perlu ditinjau pemilik proyek.
