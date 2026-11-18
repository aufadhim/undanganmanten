# Satu ilustrasi pasangan dan perbaikan beban editor

## Perilaku

40 template Immersia memakai satu sumber ilustrasi pasangan untuk sampul, hero, profil dan penutup. Tidak ada lagi pilihan unggah pose Hero terpisah. Posisi/ukuran Sampul dan Hero tetap independen dan penanda kepala berada di Hero. ID template, isi undangan dan foto galeri tidak diubah.

Pengaturan lama dengan dua pose dimigrasikan menjadi satu sumber: unggahan sampul diprioritaskan, unggahan hero menjadi fallback jika sampul kosong. Satu record pengaturan tersimpan dimigrasikan. Kolom database lama dipertahankan untuk kompatibilitas tetapi tidak lagi dipakai sebagai pose kedua.

## Pembersihan yang dilakukan

- 93 aset lokal yang sudah tidak direferensikan di sumber/runtime dihapus: 36.757.968 byte.
- 218 gambar aktif diperkecil, menghemat 57.443.910 byte tambahan. Batas sisi panjang pasangan/latar zona 1024 px; panorama maksimal 2160 px. Alpha dan rasio dipertahankan.
- Total pengurangan lokal 94.201.878 byte (89,8 MiB).
- R2: 3 objek aplikasi tanpa referensi aktif dihapus, 4.285.044 byte (4,1 MiB). 15 objek lainnya dipertahankan. Objek di luar namespace aplikasi, upload baru <24 jam, inventaris berstatus reserved, dan setiap referensi bisnis tetap dilindungi.
- Audit membaca seluruh 23 model bisnis sebelum penghapusan. UploadedAsset diperlakukan sebagai inventaris, AdminAuditLog sebagai histori; hasil ilustrasi dan permintaan ilustrasi tetap dihitung sebagai referensi.

Laporan terperinci berada di `output/asset-cleanup/`. Script R2 `backend/tools/audit-r2-unused.mjs` default read-only, `--apply` memeriksa ulang lalu menghapus kandidat. Script migrasi `backend/tools/unify-character-settings.mjs`.

## Jalur lambat yang diperbaiki

- Pergantian preset tidak memicu scan/cleanup bucket karena mengganti palet tidak melepas media. Response tidak memuat ulang seluruh daftar tamu; frontend mempertahankan data tamu yang sudah ada.
- Cleanup setelah simpan tema dijadwalkan terpisah dan digabung per pemilik. Penghapusan gagal tetap tercatat untuk retry yang sudah ada. Inventaris yang referensinya tidak berubah tidak ditulis ulang.
- Konversi ilustrasi milik pengguna memakai cache server maksimal 16 MiB / 10 menit. Request yang sudah diotorisasi memakai key pemilik dan URL immutable.
- Pratinjau berbagi request ilustrasi yang sedang berjalan dan cache maksimal 8 MiB / 4 hasil / 5 menit antarremount tema.
- Signature pembaruan pratinjau tidak lagi menserialisasi base64 ilustrasi pada setiap gerakan slider. Transfer pose tetap memakai pesan ringan.
- Renderer berbagi texture untuk sumber gambar yang sama dalam satu WebGL context; cache direset saat context dipulihkan. Snapshot buku tidak membuang texture yang masih dipakai cache.
- Layer dekorasi yang dinonaktifkan tidak dimuat; source cover yang tidak tersedia tidak diminta.

Pemeriksaan terbatas: parse sintaks sumber yang berubah dan audit referensi aset (tidak ada referensi aset hilang pada 34 pack baru). Tidak menjalankan build, test suite atau browser QA. Belum ada benchmark waktu simpan/pergantian tema, sehingga tidak mengklaim angka percepatan tertentu. Database/R2 latency dan download pertama masih berpengaruh.
