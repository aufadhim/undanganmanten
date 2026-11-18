# Sapuan ivory bersama — acuan Viridarium

Semua template aktif memakai `frontend/public/templates/shared/ivory-wash.css` sebagai pengaturan terakhir untuk sapuan teks. Immersia memuat stylesheet di HTML; Signature memuatnya melalui komponen `CoverAmbience`. Kertas editorial, foto, input, tombol, dan background dunia bukan sapuan teks dan tidak dihapus.

- Pigmen bagian: warna RGB 255/251/241, alpha .87 di pusat, .79 pada 43%, .38 pada 66%, hilang pada 82%; blur 12px. Ini nilai Viridarium.
- Judul: gradient judul Viridarium, blur 12px; area dibatasi di sekitar heading, maksimal 640px pada layar lebar.
- Salam dan tombol pembuka: gradient greeting Viridarium, blur 10px, tambahan hanya 4px horizontal / 12px vertikal.
- Bagian cerita/profil/form: ukuran mengikuti kotak teks +24px horizontal / +40px vertikal. Tidak ada lapisan panel putih kedua di atasnya.
- Mesin ruang dan landscape sama-sama memakai `shared/ivory-wash.js` untuk geometri, sehingga perubahan ukuran teks/viewport tidak menghasilkan bed putih dengan penyebaran berbeda.

Ubah token di stylesheet bersama, bukan menambah gradient baru per tema. Saat menambah tema baru, muat stylesheet setelah CSS tema. Jangan menghidupkan kembali card putih, awan bitmap atau mask tambahan di atas pigment bed.
