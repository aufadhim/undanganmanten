# Ekspansi 34 template Immersia

Status: tahap 8 — seluruh bagian pada 34 template baru sudah melalui authoring komposisi. Sudah disambungkan ke katalog, pratinjau, pemilihan tema server, dan mode coba. Belum diuji/build atau diperiksa di browser. Catatan tahap terakhir: `TEMPLATE_FINAL_GROUP_COMPOSITION.md`.

Sumber salinan: engine 1 dari Sogan (`sekar-jawa`), engine 2 dari Pramaya, engine 3 dari Riviera. Runtime engine tetap digunakan bersama. Nama ilustrasi lokal memakai `ilustrasi1.webp`, `ilustrasi2.webp`, dst.; kegunaannya tercatat dalam `assets/manifest.json` masing-masing template. Daftar kerangka ada di `TEMPLATE_SCAFFOLDS.json`.
Nama folder bersifat deskriptif; nama tampilan final ditentukan sebelum implementasi masing-masing tema.

## Komposisi yang disepakati

| Engine | Sudah ada | Tambahan | Total akhir |
|---|---|---|---|
| 1 | Viridarium, Sogan (2) | 11 | 13 |
| 2 | Pramaya (1) | 12 | 13 |
| 3 | Riviera, Wasesa, Ludora (3) | 11 | 14 |
| Total | 6 | 34 | 40 |

## Cara pengerjaan

Kerjakan satu tahap untuk seluruh kelompok template, bukan menyelesaikan satu template dari awal sampai akhir.
Tahap pertama ini tidak menjalankan testing, build, browser QA, generation aset, atau registrasi katalog.
Tahap berikutnya dibahas dengan pengguna; kandidat urutan: arahan visual → daftar aset dan komposisi → pembuatan aset → konfigurasi engine → penyambungan katalog → pemeriksaan bersama setelah satu kelompok siap.

## Daftar folder

Folder komponen berada di `frontend/src/components/templates/`.
Folder runtime berada di `frontend/public/templates/`; tiap folder sudah memiliki `assets/`.

| Folder | Engine | Kelompok | Konsep |
|---|---|---|---|
| `melayu-balairung` | 1 | Budaya Nusantara | Melayu — istana dan balairung |
| `melayu-hikayat` | 2 | Budaya Nusantara | Melayu — buku hikayat, taman dan sungai |
| `sunda-pendopo` | 1 | Budaya Nusantara | Sunda — halaman rumah dan pendopo |
| `sunda-parahyangan` | 3 | Budaya Nusantara | Sunda — perkampungan dan pegunungan |
| `bali-pekarangan` | 1 | Budaya Nusantara | Bali — taman dan halaman berlapis |
| `bali-subak` | 3 | Budaya Nusantara | Bali — persawahan dan perbukitan |
| `banjar` | 3 | Budaya Nusantara | Banjar — perjalanan menyusuri sungai |
| `dayak` | 2 | Budaya Nusantara | Dayak — album cerita, rumah panjang dan hutan |
| `bugis-makassar` | 1 | Budaya Nusantara | Bugis–Makassar — rumah dan pelataran |
| `toraja` | 2 | Budaya Nusantara | Toraja — buku cerita, tongkonan dan pegunungan |
| `sumba` | 3 | Budaya Nusantara | Sumba — sabana dan kampung adat |
| `flores` | 3 | Budaya Nusantara | Flores — perbukitan dan perkampungan |
| `maluku` | 2 | Budaya Nusantara | Maluku — buku perjalanan kepulauan |
| `papua` | 3 | Budaya Nusantara | Papua — perjalanan panorama alam; wilayah budaya spesifik belum ditentukan |
| `minangkabau` | 1 | Budaya Nusantara | Minangkabau — rumah gadang dan pelataran |
| `masjid-taman` | 1 | Sakral / Religi | Islamic — halaman dan interior masjid |
| `masjid-manuskrip` | 2 | Sakral / Religi | Islamic — manuskrip undangan, taman dan masjid |
| `katedral` | 1 | Sakral / Religi | Cathedral — lorong, pilar dan kaca patri |
| `katedral-album` | 2 | Sakral / Religi | Cathedral — album pernikahan, kapel dan taman |
| `taman-tionghoa` | 1 | Tradisi Asia | Chinese — taman dan halaman rumah |
| `peranakan` | 2 | Tradisi Asia | Peranakan — album kisah keluarga |
| `chateau` | 3 | Eropa Romantis | Kebun Château — taman, air mancur dan château |
| `edinburgh` | 3 | Eropa Romantis | Edinburgh — jalan batu, taman dan kastel |
| `paris` | 2 | Eropa Romantis | Paris — buku sketsa perjalanan romantis |
| `london` | 2 | Eropa Romantis | London — album perjalanan vintage |
| `elegant-ivory` | 1 | Klasik & Kemewahan | Elegant — ruang ivory dan champagne |
| `elegant-velvet` | 2 | Klasik & Kemewahan | Elegant — album beludru dan kemewahan malam |
| `kaligrafi` | 2 | Klasik & Kemewahan | Kertas bertekstur dan kaligrafi — manuskrip undangan |
| `cinema` | 1 | Klasik & Kemewahan | Cinema — ruang bioskop dan set film |
| `kingdom` | 2 | Klasik & Kemewahan | Kingdom — buku dongeng kerajaan |
| `sabana` | 3 | Cheerful / Playful | Cheerful — padang, sabana dan pegunungan |
| `urban-editorial` | 3 | Cheerful / Playful | Cheerful — perkotaan dan editorial kota |
| `mural` | 3 | Cheerful / Playful | Cheerful — perjalanan mural dan instalasi warna |
| `monokrom` | 1 | Cheerful / Playful | Monokrom / grayscale — beberapa ruang studio |
