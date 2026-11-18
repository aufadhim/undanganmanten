# UndanganManten — Template Engine Handoff

Baca `PROMPT_MODEL_LAIN.md` terlebih dahulu. Paket ini adalah snapshot kode kerja, bukan hanya moodboard atau pseudocode. Tujuannya melanjutkan pembuatan template di model AI/editor/harness lain tanpa mengubah perilaku engine yang sudah disepakati.

## Isi dan batasan
- `frontend/`: source aplikasi React/Vite, shared components, ketiga engine, aset tema, unit tests, dan preview lokal tanpa login.
- `backend/`: source, schema/migrations, dan tests sebagai referensi integrasi. Database, akun, kredensial, file unggahan pengguna, dan riwayat Git tidak ikut.
- `docs/handoff/`: arsitektur, aturan visual, langkah membuat tema, checklist, dan prompt.
- `docs/`: panduan engine dan tema yang relevan.
- `MANIFEST.sha256`: checksum berkas paket; `EXPORT_REPORT.json`: pengecualian/sanitasi.

Ini **bukan backup produksi**, tidak memuat database atau akses Neon/R2/Google. Backend tidak perlu dijalankan untuk mengembangkan template. Fitur yang bergantung server seperti penyimpanan, RSVP nyata, autentikasi, unggahan, pembayaran tetap memerlukan backend dan konfigurasi layanan saat diintegrasikan.

Potret pasangan personal Ludora tidak dibagikan. Dalam paket, keduanya menggunakan karakter contoh generik. Proyek asli tidak diubah. Nama file aset dipertahankan agar kontrak konfigurasi dan tes tetap sama; isi gambarnya diganti pada salinan ekspor saja.

## Menjalankan di komputer atau harness lain
Memerlukan Node.js 22 LTS dan npm. Ekstrak ZIP, buka folder hasil ekstrak sebagai workspace AI/editor, lalu:

```sh
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 4175
```

Buka `http://127.0.0.1:4175/template-lab.html?theme=viridarium`.
Pilihan: `viridarium`, `sekar-jawa`, `pramaya`, `riviera`, `wasesa`, `ludora`.
Lab menggunakan **wrapper React produksi dan adapter produksi** dengan data contoh, tanpa akun atau database. Gunakan tombol pilihan tema, tampilan HP/lebar, buka undangan, dan reload preview. Internet diperlukan untuk `npm ci` dan font eksternal; kode/aset engine sendiri disertakan.

Untuk aplikasi CMS lengkap: gunakan proyek UndanganManten asli dan konfigurasi backend sendiri. Jangan menganggap preview lab sebagai pengganti pengujian penyimpanan CMS.

```sh
npm run test:templates
npm run build
```

Untuk harness berbasis browser/cloud, jalankan Vite pada host/port yang ditentukan harness. Jangan membuka HTML lewat `file://`: import module, fetch JSON, dan iframe membutuhkan origin HTTP yang sama.

## Urutan belajar
1. `ENGINE_MAP.md`: engine 1–3, file utama, kontrak bersama.
2. `DESIGN_CONTRACT.md`: preferensi produk yang wajib dipertahankan.
3. `NEW_TEMPLATE_WORKFLOW.md`: implementasi, registrasi, dan verifikasi.
4. Dokumen engine/tema di `docs/`, khususnya `ENGINE_3_RIVIERA.md` dan `COVER_AMBIENCE.md`.

Versi handoff: 1 November 2026. Path di panduan relatif terhadap root hasil ekstrak, bukan path komputer pemilik proyek. ID historis `garden-canvas` dan `sekar-jawa` tetap valid; jangan mengganti ID database saat hanya mengganti nama tampilan.
