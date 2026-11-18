# Sumber tunggal konfigurasi adegan

40 template Immersia kini memiliki satu berkas yang diedit di `shared/template-scenes/<folder>.json`. Tidak ada perubahan data undangan pengguna. Migrasi membandingkan kedua salinan konfigurasi lama; seluruh 40 pasangan identik sebelum dipindahkan.

Contoh:

- Viridarium: `shared/template-scenes/viridarium.json`.
- Sogan: `shared/template-scenes/sekar-jawa.json`.
- Pramaya: `shared/template-scenes/pramaya.json`.
- Promenade: `shared/template-scenes/urban-editorial.json`.

## Struktur

`invitation` berisi konfigurasi lama tanpa mengganti kontrak runtime: aset, copy/identitas, posisi dan ukuran, kamera, gaya, gerakan, serta pengaturan komposisi. Untuk engine 3, `landscape` menyimpan dunia, area, stop kamera, karakter dan dekorasi dalam berkas sumber yang sama.

Lokasi sumber dipilih oleh `sceneSource` pada record di `shared/template-registry.json`. Tambahkan sumber ini bersama record template baru. Tiga Signature tidak memakai konfigurasi adegan Immersia sehingga tidak mendapat berkas scene.

## Hasil otomatis

- `frontend/src/components/templates/<folder>/defaultConfig.json` untuk import React/editor.
- `frontend/public/templates/<folder>/config/invitation.json` untuk runtime iframe.
- `frontend/public/templates/<folder>/landscape.json` untuk engine 3.
- `frontend/src/config/sceneSources.generated.json` mencatat sumber dan hash revisi.

File hasil tetap disimpan agar konteks Docker frontend dapat dibangun sendiri. Secara fisik masih ada hasil frontend/runtime, tetapi tidak ada lagi dua sumber yang harus disunting dan disamakan manual. Konfigurasi sumber tidak diunduh sebagai salinan tambahan oleh browser.

## Sinkronisasi

`npm run templates:sync` dan `npm run registry:sync` sama-sama menyinkronkan registry beserta scene. Hook dev/build yang sudah ada menjalankannya sebelum mulai. Mode dev mengamati JSON sumber; perubahan menghasilkan hanya file yang isinya berubah. Jika file hasil diedit langsung, watcher mengembalikannya dari sumber. Tidak ada polling atau pekerjaan sinkronisasi dalam aplikasi produksi.

Implementasi: `tools/lib/scene-config.cjs`. Sumber divalidasi sebelum seluruh hasil dibuat; generator menolak versi/struktur yang tidak sesuai atau peta engine 3 yang hilang.

Script authoring lama sekarang mengimpor `tools/lib/scene-authoring-fs.cjs`. Adapter lokal ini mengarahkan akses path konfigurasi lama ke bagian sumber yang tepat, kemudian menyinkronkan hasil. Ia tidak mengubah modul node:fs global; CSS, aset, dan dokumen tetap memakai operasi filesystem biasa. Script ekspor/verifikasi paket mandiri tidak dialihkan karena bukan penulis konfigurasi proyek.

Penyatuan ini menyasar konfigurasi JSON. CSS dan ilustrasi masing-masing template tetap berada di foldernya. Tidak menjalankan test suite, build atau browser QA; hanya migrasi, validasi sinkronisasi dan pemeriksaan sintaks.
