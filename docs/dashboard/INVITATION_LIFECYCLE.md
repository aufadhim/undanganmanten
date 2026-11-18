# Pengelolaan undangan dan kuota penyimpanan

`/dashboard` membuka Undangan Saya. Editor menggunakan `?invitation=<id>`.

## Slot akun

Maksimal **3 undangan total**, termasuk draft, terbit, kedaluwarsa, arsip, dan paket berbayar. Arsip tidak membuka slot. Duplikasi mengambil satu slot dan menjadi Trial. Tidak ada pengecualian akun berbayar untuk membuat undangan tanpa batas. Akun lama yang sudah memiliki >3 undangan tidak dihapus otomatis, tetapi tidak dapat membuat/duplikat sampai memiliki <3.

## Arsip dan hapus

Arsip menghentikan akses publik dan mempertahankan konten serta penggunaan storage. Pulihkan mengembalikan draft tanpa mereset paket atau masa aktif. Tidak ada tab Sampah.

Hapus permanen membutuhkan konfirmasi slug. Relasi desain (ucapan, order, konten) dihapus. Master tamu dan RSVP dimiliki pernikahan dan tetap tersedia meskipun desain dihapus; lihat docs/workspace/ARCHITECTURE.md. Sebelum menghapus, storage lama diindeks; setelah penghapusan file dicek terhadap referensi seluruh undangan. Aset bawaan template tidak termasuk ledger unggahan dan tidak dihapus. File bersama dipertahankan sampai tidak ada pemakai. Kegagalan pembersihan dicatat dan tetap dihitung dalam pemakaian, dicoba ulang melalui cron pukul 02:00 waktu server. Akun yang dihapus menggunakan pembersihan yang sama.

## Media

- Maksimal 50 MiB per undangan, 150 MiB per akun.
- Maksimal 40 file per undangan dan 100 file per akun.
- Gambar input maksimal 5 MiB; video 10 MiB; audio 8 MiB.
- Gambar dikoreksi orientasi, diperkecil ke batas 1280×1600 dengan rasio tetap, dan dikompresi WebP kualitas 78. Kuota byte menggunakan hasil kompresi sebenarnya.
- Ledger `uploaded_assets` menghitung satu objek fisik sekali per akun. Reservasi serializable mencegah unggahan serentak melewati kuota.
- File duplikat berupa referensi, bukan unggahan fisik baru. Kuota undangan menghitung file yang dipakai undangan tersebut, sedangkan akun menghitung file fisik unik.
- Unggahan baru yang belum dihubungkan ke konten diberi waktu 24 jam untuk disimpan. Tetap dihitung dalam kuota. Setelah itu dibersihkan jika tidak dipakai.
- R2 lama diindeks dengan pagination per prefix undangan. Upload lokal lama diindeks dari URL konten dan ukuran file lokal. Pemeriksaan yang gagal menolak upload baru; tidak menganggap pemakaian nol.

## Publikasi

Aktivasi paket tidak otomatis menerbitkan. Checklist server mewajibkan paket aktif, masa berlaku valid, nama mempelai dan detail acara lengkap, serta hadiah/livestream lengkap jika aktif. Tarik publikasi mengembalikan draft. Pembayaran terlambat tidak memulihkan undangan di Arsip. Editor subresource menolak undangan arsip.

## Validasi

- `npm --prefix backend test`
- `npm --prefix frontend run test:templates`
- `npm --prefix frontend run build`
- `backend/tests/lifecycle-smoke.mjs`: alur publikasi dan penghapusan permanen pada akun disposable.
- `backend/tests/storage-quota-smoke.mjs`: jalankan dengan server uji port 4011, R2 dinonaktifkan, dan BACKEND_URL yang sesuai. Menguji slot termasuk arsip/berbayar, penolakan batas byte, konfirmasi hapus, duplikasi berbagi file dan penghapusan file lokal pada referensi terakhir. Akun/file uji dibersihkan; tidak memakai undangan pengguna atau transaksi Midtrans.

Migrasi `20261029020000_storage_quota` menambahkan ledger. Status trashed lama dialihkan ke archived tanpa penghapusan data. Enum trashed dipertahankan hanya untuk kompatibilitas migrasi PostgreSQL; tidak dapat dipilih melalui API.
