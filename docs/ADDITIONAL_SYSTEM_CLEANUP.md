# Pembersihan tambahan sistem

## Yang dihapus

- 91 aset publik tanpa referensi produksi atau undangan tersimpan, termasuk awan lama, variasi maroon lama, thumbnail lama, dan ornamen Signature yang tidak dipanggil.
- Empat komponen React tanpa jalur impor produksi: Header/Footer lama, DashboardOnboarding lama, dan panel AdminIllustrations dari alur AI yang sudah dilepas.
- `recharts` dan `postcss-prefix-selector`, beserta dependensi transitif yang tidak lagi diperlukan: npm melepas 46 paket. Ukuran node_modules frontend turun dari sekitar 279 MiB menjadi 235 MiB. Ini pengurangan dependensi pengembangan, bukan klaim penghematan RAM browser sebesar itu.
- `frontend/dist` lama (~71 MiB). Ini keluaran build yang dapat dibuat ulang, bukan sumber. Tidak membuat build pengganti pada tahap ini.

Aset dan empat komponen yang dihapus berjumlah 9.273.057 byte (~8,8 MiB). Daftar tepat: `output/asset-cleanup/additional-cleanup-result.json`.

## Pemuatan awal

- Daftar Google Fonts global dipangkas menjadi enam keluarga yang dipakai aplikasi dan tiga Signature. Font lain tetap dimuat oleh fontLoader saat dibutuhkan.
- Workbox tidak lagi memasukkan seluruh folder runtime template dan chunk bernama *Template ke precache awal. Browser memuat template sesuai pilihan.
- URL runtime template yang stabil tidak diberi immutable setahun oleh Nginx; ETag/revalidasi dipakai agar revisi engine tidak tertahan cache lama. Aset build lain tetap mengikuti kebijakan cache yang ada.

## Yang dipertahankan

Bingkai foto yang dipilih melalui pemetaan dinamis, seluruh folder ornamen custom Nawasena (sebagian dipanggil berdasarkan angka dinamis), favicon/logo, media dengan referensi database, dua helper kontrak pengujian, dokumen handoff, ekspor pengguna dan referensi desain tetap disimpan. Tidak ada penghapusan database/R2 tambahan pada tahap ini.

Referensi tersimpan diperiksa melalui `backend/tools/audit-local-media-references.mjs` sebelum penghapusan lokal. Audit graf impor produksi mengunjungi 257 file dan memeriksa dynamic import galeri secara manual. Audit konfigurasi 40 Immersia tidak menemukan sumber aset yang hilang. Lockfile dan sintaks konfigurasi Vite dibaca; tidak menjalankan build, test suite atau browser QA. Pengaturan PWA/Nginx baru berlaku pada build/deployment berikutnya.
