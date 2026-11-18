# UI cat air UndanganManten

Tampilan produk diselaraskan dengan landing page: warna ivory/sage, logo bunga, ilustrasi taman cat air, tipografi Cormorant Garamond dan Manrope, serta kontrol editor yang tenang.

## Cakupan

- Login, signup beserta tampilan verifikasi OTP, lupa password, dan reset password menggunakan komponen artwork dan brand bersama.
- `/signin` mengarah ke `/login`.
- Dashboard awal, editor dashboard, sandbox, katalog, navigasi, formulir pembuatan, notifikasi, serta tampilan admin menggunakan sistem visual yang sama.
- Panduan, ketentuan, privasi, serta tampilan memuat/undangan tidak ditemukan ikut disesuaikan.
- Desain template undangan dan eksperimen depth-lab tidak dirombak. Pratinjau undangan mempertahankan token visual temanya sendiri.

## Sumber utama

`frontend/src/styles/atelier.css` berisi sistem visual produk yang dibatasi dengan kelas `.atelier-app`. Komponen bersama berada di `frontend/src/components/atelier/`. Aset memakai ulang `frontend/public/assets/landing-canvas/` sehingga tidak menambah gambar raster baru.

## Verifikasi

Build berhasil. Tes template 15/15 dan tes backend 28/28 lulus. Pemeriksaan 89 referensi aset literal hasil build tidak menemukan file hilang.

Browser: halaman login, signup, lupa/reset password, panduan, ketentuan, privasi, dan sandbox diperiksa pada lebar 360/390 piksel tanpa halaman melebar. Navigasi signin, tautan pemulihan, panel warna/profil, dan buka-tutup pratinjau diuji. Susunan editor tablet 769–900 piksel diperbaiki dan diperiksa pada 784 piksel.

Dashboard awal, modal pembuatan, editor, serta admin diperiksa memakai data sintetis pada pratinjau terisolasi. Tidak menggunakan kredensial akun, mengirim OTP/email, membuat undangan asli, maupun melakukan pembayaran. Pengujian autentikasi dan pengiriman email secara menyeluruh tidak dilakukan.

Pratinjau data sintetis dan berkas bantu sudah dihapus. Server dev utama pada port 4175 tetap berjalan sesuai permintaan pengguna. Screenshot di folder ini merupakan bukti pemeriksaan, bukan data pengguna.
