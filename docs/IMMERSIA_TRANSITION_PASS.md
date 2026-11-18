# Immersia — tahap perbaikan transisi

2 November 2026. Lingkup: 40 template Immersia melalui tiga engine bersama. Skala desain, pijakan, dan sapuan ivory akan ditangani pada tahap terpisah.

## Perubahan

- Engine 1: perpindahan sampul ke hero memakai satu figur sementara dalam koordinat layar. Ukuran dan posisi bergerak dari proyeksi renderer sampul menuju proyeksi hero. Figur di kedua canvas disembunyikan selama perpindahan dan dipulihkan pada titik akhir; memakai gambar yang sama, tidak membuat aset baru.
- Engine 2: halaman buku mengambil komposisi interior persis tanpa penggantian ukuran sampul. Snapshot dipertahankan hingga interior tampil, lalu memudar 650 ms. Waktu ambient interior ditahan selama perjalanan buku agar frame akhir tidak bergeser dari snapshot.
- Engine 3: posisi figur diperbarui pada progress kamera yang sama (sebelumnya satu frame terlambat). Perjalanan cover/hero menggunakan satu figur yang berinterpolasi, bukan dua ukuran yang saling crossfade.
- Ketiganya memakai timing kemunculan panel bersama: keluar lebih singkat, masuk sekurangnya sekitar satu detik pada perjalanan normal. Teks hero engine 1/2 dianimasikan melalui variabel opacity yang benar-benar mengendalikan CSS.
- Penutup engine 1/2: teks keluar sebelum perjalanan exterior dan masuk bertahap sesudah tiba. Navigasi ditahan selama proses tersebut.
- Jam animasi mengabaikan waktu tab tersembunyi dan membatasi lompatan setelah frame macet. Gerakan rendah tetap didukung melalui prefers-reduced-motion.
- Idle camera engine 1/2 tidak lagi menambah offset mendadak setelah titik akhir perjalanan.

## Pemeriksaan

`node --test frontend/tests/transition-motion.test.js frontend/tests/room-backgrounds.test.js`

6 pengujian lolos: envelope opacity, jam terlihat, titik awal/akhir perjalanan maju/mundur untuk seluruh 14 template landscape di HP dan desktop, proyeksi figur, satu aset pasangan pada seluruh 40 template, serta empat latar ruang seluruh 26 template engine 1/2. Pemeriksaan ini membuktikan konsistensi matematika/konfigurasi; bukan klaim semua frame di semua perangkat sudah diperiksa secara visual.

Pemeriksaan browser lokal: Sogan (buka, penutup, kembali ke sampul), Pramaya (masuk buku, keluar ke penutup, masuk kembali ke hero); tanpa error JavaScript. Ludora (sampul ke hero, perjalanan ke countdown) menjadi sampel engine landscape. Tidak ada perubahan database pengguna atau deployment.
