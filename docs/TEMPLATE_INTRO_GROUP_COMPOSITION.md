# Kutipan dan profil — kelompok pertama 34 template

Status: konfigurasi, CSS, serta jalur kamera kelompok hero → kutipan → wanita → pria sudah ditulis untuk 34 template. Belum menjalankan testing, build, atau browser QA; belum didaftarkan ke katalog.

## Perjalanan

- Hero → kutipan: mendekat di ruang yang sama; panel ivory dan teks muncul mendekati akhir gerakan.
- Kutipan → profil: teks hilang, kamera mundur ke komposisi pasangan, berhenti sebentar, lalu bergeser ke profil.
- Antarprofil: kembali melihat pasangan sebelum bergeser ke sisi berikutnya.
- Arah sebaliknya memakai jalur yang sama-sama dimulai dari posisi kamera saat ini.
- Durasi kutipan 4 detik, menuju profil 5 detik, kembali ke hero 3,4 detik. Preferensi reduced motion memakai perpindahan singkat.
- Tidak memuat ulang buku atau mengganti ruang/panorama untuk tiga bagian ini.

## Figur dan teks

- Tetap satu ilustrasi pasangan hero; tidak membuat aset wanita/pria terpisah.
- Penanda kepala memilih sisi subjek, sedangkan tinggi badan dan batas figur menentukan jarak kamera.
- Kamera menggeser garis tengah pasangan ke tepi viewport, dengan ruang baca di sisi berlawanan.
- Tubuh disusun dengan acuan kaki sekitar 88% tinggi layar; zoom dibatasi tinggi dan lebar agar tidak menjadi close-up wajah.
- Karena kedua figur berada dalam satu ilustrasi dan beberapa pose bergandengan, garis tepi dapat berpotongan dengan tangan yang bersentuhan; koreksi titik penanda tetap dapat dilakukan saat tinjauan visual.
- Kutipan menggunakan label dan isi 11 px; profil memakai nama 30 px pada HP (27 px pada layar pendek), isi 11 px. Pengaturan tipografi pengguna tetap bisa menimpa default.
- Nama panjang membungkus, bio panjang dapat digulir di kolom baca.
- Sapuan ivory memakai standar bersama Viridarium dan mengikuti ukuran kolom.

## Path pengaturan

Per template:

- `frontend/public/templates/<slug>/intro-composition.css`: kutipan, kolom profil, teks dan responsif.
- `frontend/public/templates/<slug>/config/invitation.json`: `layout.profileBody*`, `profileHeight`, `profileFootLine`, serta `composition.intro`.
- Salinan React: `frontend/src/components/templates/<slug>/defaultConfig.json`.
- Engine 3: stop `janji`, `wanita`, dan `pria` dalam `landscape.json` tetap di area hero.

Runtime bersama:

- `frontend/public/templates/shared/intro-journey.js`: jalur lokal, jeda komposisi pasangan, waktu reveal dan opacity.
- `frontend/public/templates/shared/profile-framing.js`: framing badan dan penggeseran pasangan.

Helper authoring: `tools/apply-template-intro-compositions.mjs`. Jalankan setelah helper sampul/hero bila mengganti ilustrasi dan menghitung ulang komposisi. Keduanya menulis konfigurasi; bukan test runner.

## Template

| Template | Engine | Bagian |
|---|---:|---|
| melayu-balairung | 1 | Kutipan · Wanita · Pria |
| melayu-hikayat | 2 | Kutipan · Wanita · Pria |
| sunda-pendopo | 1 | Kutipan · Wanita · Pria |
| sunda-parahyangan | 3 | Kutipan · Wanita · Pria |
| bali-pekarangan | 1 | Kutipan · Wanita · Pria |
| bali-subak | 3 | Kutipan · Wanita · Pria |
| banjar | 3 | Kutipan · Wanita · Pria |
| dayak | 2 | Kutipan · Wanita · Pria |
| bugis-makassar | 1 | Kutipan · Wanita · Pria |
| toraja | 2 | Kutipan · Wanita · Pria |
| sumba | 3 | Kutipan · Wanita · Pria |
| flores | 3 | Kutipan · Wanita · Pria |
| maluku | 2 | Kutipan · Wanita · Pria |
| papua | 3 | Kutipan · Wanita · Pria |
| minangkabau | 1 | Kutipan · Wanita · Pria |
| masjid-taman | 1 | Kutipan · Wanita · Pria |
| masjid-manuskrip | 2 | Kutipan · Wanita · Pria |
| katedral | 1 | Kutipan · Wanita · Pria |
| katedral-album | 2 | Kutipan · Wanita · Pria |
| taman-tionghoa | 1 | Kutipan · Wanita · Pria |
| peranakan | 2 | Kutipan · Wanita · Pria |
| chateau | 3 | Kutipan · Wanita · Pria |
| edinburgh | 3 | Kutipan · Wanita · Pria |
| paris | 2 | Kutipan · Wanita · Pria |
| london | 2 | Kutipan · Wanita · Pria |
| elegant-ivory | 1 | Kutipan · Wanita · Pria |
| elegant-velvet | 2 | Kutipan · Wanita · Pria |
| kaligrafi | 2 | Kutipan · Wanita · Pria |
| cinema | 1 | Kutipan · Wanita · Pria |
| kingdom | 2 | Kutipan · Wanita · Pria |
| sabana | 3 | Kutipan · Wanita · Pria |
| urban-editorial | 3 | Kutipan · Wanita · Pria |
| mural | 3 | Kutipan · Wanita · Pria |
| monokrom | 1 | Kutipan · Wanita · Pria |

Countdown, acara, dan rundown sudah diatur pada tahap berikutnya; lihat `TEMPLATE_EVENT_GROUP_COMPOSITION.md`.
