# Konfigurasi adegan — sumber yang diedit

Satu JSON per template Immersia. Nama berkas mengikuti folder runtime; ID katalog dan nama tampilannya ada di registry.

- `invitation`: ilustrasi, identitas/teks bawaan, posisi pasangan, kamera, gaya, durasi dan komposisi.
- `landscape`: peta panorama untuk engine 3 (opsional untuk engine 1/2).
- `schemaVersion`: versi pembungkus sumber, saat ini 1.

Jalankan `npm run templates:sync` dari root setelah mengubahnya. Dev/build melakukan sinkronisasi otomatis. Mode dev juga menyinkronkan saat sumber JSON berubah. Jangan mengedit defaultConfig.json/runtime invitation.json/landscape.json hasil sinkronisasi.
