# Registry template tunggal

Sumber yang diedit: **`shared/template-registry.json`**.

Berkas ini mengatur ID stabil, nama katalog, koleksi/kategori, engine, status aktif, thumbnail, deskripsi, folder/komponen, jalur runtime, alias ID, preset warna/font dan bingkai foto bawaan. Terdapat 43 template: 40 Immersia dan 3 Signature. ID undangan yang tersimpan tidak diganti.

## Cara mengubah

1. Edit record di `templates`. Untuk nama/kategori/status, cukup ubah record tersebut.
2. Preset yang dipakai bersama berada di `presets`; record template memilihnya lewat `preset`. Buat key preset baru jika perubahan harus khusus satu template.
3. Jalankan `npm run registry:sync` dari root proyek. Mode dev serta build frontend juga melakukan sinkronisasi sebelum mulai.
4. Untuk template baru, buat komponen/runtime dahulu, kemudian tambahkan satu record registry. Sinkronisasi menolak ID/alias duplikat, kategori/preset tak dikenal dan komponen yang belum ada.

`active:false` mengeluarkan template dari pilihan aktif, preset dan loader aktif. Untuk menutup penjualan sementara tanpa mengganti perilaku undangan lama, gunakan ketersediaan tema di admin yang tetap berada di database. Registry tidak mengganti kontrol operasional tersebut.

## Hasil otomatis — jangan diedit manual

- `frontend/src/config/templateRegistry.generated.js`: metadata dan fungsi lookup.
- `frontend/src/config/templateSettings.generated.js`: preset tanpa duplikasi palet per template.
- `frontend/src/config/templateLoaders.generated.js`: daftar import komponen secara lazy.
- `backend/src/config/templateRegistry.generated.js` dan `templateSettings.generated.js`: data yang sama untuk backend.

Semua hasil memuat revision hash sumber. Generator hanya menulis ketika isinya berubah, sehingga tidak menyalakan ulang dev server tanpa perlu. Hasil disimpan bersama kode agar Docker frontend/backend tetap bisa dibangun sendiri tanpa mengimpor folder di luar konteksnya. Sinkronkan sebelum commit/deploy; wrapper build dapat memakai hasil tersimpan dalam konteks Docker terpisah.

## Pemakai registry

Katalog tema, mode coba, pilihan tema dashboard, normalisasi ID, editor ilustrasi, kontrol susunan blok, posisi penutup, kapabilitas cover, bingkai foto, PhonePreview, metadata manifest, preset server, allowlist admin, serta layanan render ilustrasi.

Nama dan entryPath pratinjau Immersia diselesaikan dari registry, mengungguli fallback pada wrapper lama. File `themeCatalog.js`, `expandedThemes.js`, `themePresets.js` dan `activeTheme.js` kini adapter kompatibilitas, bukan daftar yang diedit terpisah.

## Batas tahap ini

Konfigurasi adegan sekarang bersumber dari `shared/template-scenes/` lewat field `sceneSource`; lihat `docs/TEMPLATE_SCENE_SOURCES.md`. Wrapper runtime dan catatan authoring tetap terpisah. Mengubah angka engine di metadata saja tidak mengonversi isi adegan ke engine lain.

Tidak melakukan migrasi database, deployment, build, atau test suite. Pemeriksaan dibatasi ke validasi generator dan sintaks sumber.
