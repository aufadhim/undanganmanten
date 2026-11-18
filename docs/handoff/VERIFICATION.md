# Verifikasi paket — 1 November 2026

Diuji pada salinan hasil ekspor, bukan hanya source asli:
- `npm run test:templates`: 113 lulus, 0 gagal.
- `npm run build`: berhasil.
- JSX template-lab berhasil dikompilasi.
- ZIP integrity check berhasil; manifest SHA-256 disertakan.
- ZIP tidak memuat .env, uploads, node_modules, database, atau potret personal Ludora v2 asli.

Dependensi pengujian menggunakan instalasi node_modules lokal melalui symlink sementara; symlink dan build output tidak ikut ekspor. Instalasi bersih `npm ci` pada mesin lain belum diuji. Lab preview baru belum melalui pemeriksaan visual browser pada proses ekspor ini; QA visual template asli dan instruksinya dicatat di dokumen engine. Backend produksi dan layanan eksternal tidak diuji dari paket.

Pembaruan skala: fixture produksi ditinjau untuk cover/hero/closing Immersia dan komposisi Signature. Pemeriksaan lebar juga menemukan dan memperbaiki bunga cover yang membesar berlebihan. Panduan ada di `docs/TEMPLATE_SPATIAL_SCALE.md`.

Perbaikan pergantian tema: referensi `patch` di endpoint apply-preset yang menyebabkan error sesudah penyimpanan dihapus. Pilihan tema dan pengaturannya ditulis dalam satu transaksi. 67 tes backend lulus, termasuk respons sukses untuk 9 tema, kegagalan transaksi, dan kepemilikan undangan. Pengujian regresi controller memakai persistence in-memory tanpa menyentuh data pelanggan.

Sapuan ivory distandarkan ke Viridarium. Computed style pada preview Viridarium dan Riviera menghasilkan gradient, blur 12px, width dan height identik untuk kutipan yang sama. Tes geometri bersama memverifikasi reveal, resize, dan hidden pada engine ruang maupun landscape. Build berhasil.
