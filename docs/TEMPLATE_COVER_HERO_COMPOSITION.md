# Komposisi sampul dan hero — 34 template

Status: pengaturan komposisi untuk seluruh 34 template sudah diterapkan pada konfigurasi lokal dan CSS. Belum diaktifkan di katalog; tidak menjalankan testing, build, atau browser QA.

## Yang diatur

- Dua pose tetap menggunakan ilustrasi pasangan yang sudah dibuat; tidak menambah figur profil terpisah.
- Skala dihitung dari batas figur transparan agar padding file tidak membuat pasangan tampak kecil.
- Titik kaki menjadi acuan alas, bayangan, dan ornamen.
- Sampul memberi ruang untuk nama/tanggal di atas dan nama tamu/tombol di bawah.
- Hero memberi ruang untuk subtitle, nama pasangan, dan tanggal; figur tetap terlihat utuh.
- Engine 1: ornamen samping diperkecil dan mengikuti alas pasangan.
- Engine 2: pose sampul dipakai untuk gambar pada halaman buku; pose hero digunakan di dalam. Buku tetap proporsional 3:2.
- Engine 3: posisi pasangan dan bunga diselaraskan dengan area taman; rasio bidang lukisan mengikuti dimensi asetnya.
- Sapuan ivory tetap memakai standar bersama Viridarium.

## Path edit

Untuk setiap `<slug>`:

- Karakter: `/Users/auf/Documents/ChatGPT/undanganmanten/frontend/src/components/templates/<slug>/defaultConfig.json` → `layout`.
- Salinan runtime: `frontend/public/templates/<slug>/config/invitation.json`.
- Framing latar/ornamen: `composition` pada kedua konfigurasi tersebut.
- Letak teks dan responsif: `frontend/public/templates/<slug>/composition.css`.
- Engine 3: peta lokal `frontend/public/templates/<slug>/landscape.json`.

Jaga kedua konfigurasi JSON tetap selaras saat mengubah angka secara manual.

Helper authoring: `tools/apply-template-compositions.cjs`. File ini mengukur gambar dan menulis konfigurasi komposisi, tidak menjalankan aplikasi. Menjalankannya kembali akan menulis ulang pengaturan komposisi manual berdasarkan tabel authoring pada script.

## Acuan ukuran

Acuan HP: 390 × 844. Tinggi figur pada sampul sekitar 42–43% layar, titik kaki sekitar 76% tinggi layar. Hero sekitar 54–55%, dengan titik kaki sekitar 90%. Figur yang lebar dibatasi agar tetap masuk layar. Ini adalah acuan pengaturan, bukan hasil pengukuran tampilan browser.

Nama menggunakan default 46 px; teks pendamping 11 px; nama tamu dan tombol 12 px. Pada layar pendek, nama memakai 40 px. Pilihan tipografi pengguna tetap dapat menimpa nilai bawaan melalui runtime.

## Rekap

| Template | Engine | Lebar sampul (unit scene) | Lebar hero (unit scene) |
|---|---:|---:|---:|
| melayu-balairung | 1 | 394.3 | 538.9 |
| melayu-hikayat | 2 | 392.6 | 533.8 |
| sunda-pendopo | 1 | 391.8 | 540.0 |
| sunda-parahyangan | 3 | 1245.9 | 1458.5 |
| bali-pekarangan | 1 | 422.4 | 546.7 |
| bali-subak | 3 | 1255.8 | 1409.4 |
| banjar | 3 | 1209.4 | 1448.4 |
| dayak | 2 | 397.0 | 538.9 |
| bugis-makassar | 1 | 408.9 | 545.9 |
| toraja | 2 | 381.4 | 536.0 |
| sumba | 3 | 1205.2 | 1424.7 |
| flores | 3 | 1245.0 | 1436.5 |
| maluku | 2 | 408.9 | 538.5 |
| papua | 3 | 1314.8 | 1425.7 |
| minangkabau | 1 | 399.3 | 539.3 |
| masjid-taman | 1 | 402.7 | 542.9 |
| masjid-manuskrip | 2 | 415.3 | 565.3 |
| katedral | 1 | 399.6 | 538.9 |
| katedral-album | 2 | 404.2 | 544.1 |
| taman-tionghoa | 1 | 398.5 | 539.3 |
| peranakan | 2 | 396.5 | 534.6 |
| chateau | 3 | 1261.3 | 1445.4 |
| edinburgh | 3 | 1247.7 | 1446.4 |
| paris | 2 | 403.6 | 540.0 |
| london | 2 | 411.0 | 547.8 |
| elegant-ivory | 1 | 396.8 | 542.9 |
| elegant-velvet | 2 | 392.3 | 527.8 |
| kaligrafi | 2 | 406.2 | 567.7 |
| cinema | 1 | 380.4 | 534.2 |
| kingdom | 2 | 433.5 | 562.5 |
| sabana | 3 | 1237.0 | 1441.4 |
| urban-editorial | 3 | 1227.4 | 1418.0 |
| mural | 3 | 1295.2 | 1436.5 |
| monokrom | 1 | 418.3 | 557.0 |

Angka scene engine 3 lebih besar karena bidang pasangan berada jauh di dalam dunia panorama, bukan karena ukuran tampilnya lebih besar.

Tahap berikutnya: perjalanan kamera bagian-bagian lain, identitas visual tiap tema, lalu pendaftaran sandbox dan peninjauan per engine.
