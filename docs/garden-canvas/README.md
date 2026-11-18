# Garden Canvas — integrasi UndanganManten

## Hasil

Katalog baru berisi Garden Canvas, Eternal, Nawasena, dan Seraya. Isvara, Lanqing, Celluloid, Nocturne, Edena, dan Yunshui dikeluarkan dari pilihan baru. Renderer serta preset lama dipertahankan untuk undangan yang sudah memakainya. Enam tema lama tersebut belum didesain ulang satu per satu.

Garden Canvas memakai hasil engine empat ruang yang sudah diekspor dan dioptimalkan, bukan video. Paket ilustrasi/musik sekitar 5 MiB. Runtime dijalankan dalam frame tersendiri agar gaya, navigasi kamera, dan siklus animasinya terpisah dari dashboard. Mengganti tema melepas frame beserta renderernya.

## Sumber utama

- `frontend/src/config/themeCatalog.js`: empat pilihan baru dan pengaturan awal Garden Canvas.
- `frontend/src/components/templates/viridarium/adapter.js`: pemetaan data UndanganManten menjadi konfigurasi engine.
- `frontend/src/components/templates/viridarium/ViridariumTemplate.jsx`: integrasi frame, simulasi editor, RSVP/ucapan publik, dan QR access pass bila tamu memiliki addon yang sesuai.
- `frontend/public/templates/viridarium/`: engine, empat ruang, awan per bagian, kamera, musik, aset, dan konfigurasi posisi kamera.
- `frontend/src/components/PreviewErrorBoundary.jsx`: kegagalan template ditahan di area pratinjau; tema lain tetap bisa dipilih.

Tidak ada CMS tambahan atau migrasi database. Memilih Garden Canvas melalui katalog menggunakan penyimpanan preset tema yang sudah ada. Urutan ruang dikunci sesuai koreografi kamera; bagian opsional dapat dinonaktifkan. Gambar pasangan dapat diganti melalui cover utama/kedua; gambar potongan transparan memberi hasil paling sesuai untuk komposisi berlapis.

## Data dan formulir

Nama/profil, acara, kutipan, galeri foto/video, cerita, rundown, dress code, livestream, Instagram, rekening/alamat, dan ucapan menggunakan data undangan. Editor tidak mengirim formulir contoh ke server. Pada undangan publik, formulir mengirim ke endpoint RSVP/ucapan yang sudah ada; kegagalan sebagian dilaporkan tanpa menyatakan semuanya tersimpan. Token akun tidak dikirim ke frame.

Musik mengikuti interaksi membuka sampul, kontrol jeda/putar, serta penghentian saat halaman/aplikasi kehilangan fokus. Fitur musik yang dimatikan tidak diputar. Aset dipakai ulang dari ekspor mobile; sumber ekspor sebelumnya tetap utuh.

## Verifikasi

- Build berhasil.
- Tes frontend 18/18 dan backend 29/29 lulus.
- Pemeriksaan aset literal hasil build: tidak ada berkas hilang; aset di konfigurasi engine juga diperiksa.
- Browser: Garden Canvas terbuka di sandbox, kamera berpindah dari sampul ke hero dan ke ruang RSVP, formulir simulasi berhasil, serta lebar 390px tidak melebar.
- Dashboard terisolasi dengan respons API sintetis: Garden Canvas → Nawasena → Seraya → Eternal → Garden Canvas tetap menampilkan editor.
- Kegagalan isi template disimulasikan dengan data salah tipe. Pesan pemulihan muncul di pratinjau; editor tetap tersedia dan mengganti tema memulihkan pratinjau.
- Tidak membuat/mengubah undangan asli selama pengujian; pengiriman RSVP publik, QR check-in langsung, dan pembayaran tidak diuji ke database.

Penyebab spesifik blank pada percobaan pengguna sebelumnya belum teridentifikasi. Perlindungan pratinjau dan normalisasi layout ditambahkan, serta pilihan lama yang akan dirombak disembunyikan.

Pratinjau data sintetis dan berkas bantu pengujian sudah dihapus. Server dev utama tetap tersedia di http://127.0.0.1:4175/sandbox?theme=garden-canvas .

## Perbaikan kutipan null

Pratinjau Nawasena dan Seraya gagal ketika database mengembalikan `quoteSettings: null`. Resolver bersama sekarang menormalkan nilai null/non-object serta hanya menerima teks kutipan berbentuk string. Tes regresi ditambahkan; 19 tes frontend lulus dan build berhasil. Keduanya juga diuji melalui browser dengan data undangan sintetis yang memiliki kutipan null, tanpa fallback error.
