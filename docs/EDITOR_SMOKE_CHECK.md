# Pemeriksaan editor setelah refactor engine

Tanggal: 2 November 2026.

Pemeriksaan browser memakai satu undangan yang sudah ada, dengan cadangan pengaturan awal. Semua perubahan uji sudah dipulihkan.

## Hasil

- Engine 1 / Viridarium: ditemukan rujukan relatif CSS dan script yang masih menunjuk lokasi lama. Diperbaiki; sampul serta transisi ke hero berhasil dimuat ulang.
- Engine 2 / Hikayat: sampul, masuk buku, hero, navigasi penutup, dan kembali ke sampul berhasil ditampilkan.
- Engine 3 / Riviera: pergantian tema, sampul, dan transisi hero berhasil ditampilkan.
- Musik: kontrol muncul setelah membuka undangan; status kontrol berubah menjadi jeda, dan terjeda ketika fokus berpindah. Kualitas audio tidak dinilai.
- Nama dan posisi hero: perubahan terlihat langsung; setelah perbaikan server, keduanya bertahan setelah reload penuh.
- Pengaturan awal (Hikayat, nama, posisi, warna/tipografi, serta URL ilustrasi) dipulihkan dan dicocokkan dengan cadangan sebelum uji. Tidak menghapus aset pengguna atau menjalankan publikasi/pembayaran.

## Perbaikan penyimpanan

PATCH hanya menulis properti yang berubah. Namun Prisma tetap memvalidasi `create` pada upsert walaupun record sudah ada. Empat properti JSON wajib sekarang selalu disediakan untuk `create`: background, bodyText, button, typography. Ditemukan pula salah referensi variabel pada jalur persetujuan ilustrasi, sudah diganti ke invitation.id.

## Pemeriksaan otomatis terarah

`node --test tests/themeSettingsPartial.test.js tests/applyThemePreset.test.js` dari folder backend: 5 lulus, 0 gagal. Menggunakan persistence tiruan; tidak mengakses database pelanggan atau R2.

## Batas pemeriksaan

Ini pemeriksaan singkat satu wakil tiap engine, bukan QA menyeluruh 43 template atau benchmark kecepatan. Pembaruan lanjutan: simpan Profil & Mempelai sekarang memakai satu endpoint dan satu transaksi API (lihat `docs/PROFILE_CONTENT_SAVE.md`). Tidak ada build produksi atau pengujian seluruh suite.
