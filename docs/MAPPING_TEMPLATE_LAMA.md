# Mapping template lama — sebelum penghapusan

Status: penghapusan selesai. Eternal, Nawasena, dan Seraya dipertahankan bersama 6 Immersia dan 34 folder baru. Sebanyak 39 ID lama dihapus dari source/preset; detail berkas tercatat di `TEMPLATE_CLEANUP.json`. Tabel berikut adalah inventaris sebelum penghapusan. Tidak menjalankan testing atau build.

## Yang dipertahankan

Enam template Immersia: Viridarium (`viridarium/`, ID `garden-canvas`), Sogan (`sekar-jawa/`), Pramaya, Riviera, Wasesa, Ludora.
34 folder perencanaan baru di `TEMPLATE_EXPANSION_PLAN.md` juga dipertahankan.
Engine `cover-stage`, `mental-canvas-2`, `mental-canvas-3`, runtime bersama Viridarium dan folder `shared` dipertahankan.

## 1. Sembilan implementasi template lama

Folder komponen pada tabel berada di `frontend/src/components/templates/`.
Path aset pada tabel relatif terhadap `frontend/`.
Thumbnail berada di `frontend/public/assets/theme-thumbnails/` kecuali dicatat lain.

| Template | Folder komponen | Ilustrasi/aset khusus | Thumbnail yang ada | Status source |
|---|---|---|---|---|
| Eternal | `eternal/` | `public/assets/eternal/` (0.77 MiB) | `eternal-key-visual-v1.webp`, `eternal-classic-v2.svg` | Masih di katalog Signature |
| Nawasena | `nawasena/` | `public/assets/nawasena/` (5.24 MiB) | Lihat referensi katalog | Masih di katalog Signature |
| Seraya | `seraya/` | Tidak ada folder aset khusus | `seraya-key-visual-v1.webp`, `seraya-editorial-v2.svg` | Masih di katalog Signature |
| Isvara | `isvara/` | `public/assets/isvara/` (6.34 MiB) | `isvara-key-visual-v1.webp` | Di luar katalog; masih di renderer/daftar kompatibilitas |
| Lanqing | `lanqing/` | `public/assets/lanqing/` (7.47 MiB) | `lanqing-key-visual-v1.webp` | Di luar katalog; masih di renderer/daftar kompatibilitas |
| Celluloid | `celluloid/` | `public/assets/celluloid/` (5.53 MiB) | `celluloid-key-visual-v1.webp` | Di luar katalog; masih di renderer/daftar kompatibilitas |
| Nocturne | `nocturne/` | `public/assets/nocturne/` (4.72 MiB) | `nocturne-key-visual-v1.webp` | Di luar katalog; masih di renderer/daftar kompatibilitas |
| Edena | `edena/` | `public/assets/edena/` (4.54 MiB) | Lihat referensi katalog | Di luar katalog; masih di renderer/daftar kompatibilitas |
| Yunshui | `yunshui/` | `public/assets/yunshui/` (4.63 MiB) | Lihat referensi katalog | Di luar katalog; masih di renderer/daftar kompatibilitas |

Thumbnail katalog Nawasena saat ini langsung memakai `/assets/nawasena/enchanted-joglo-hero.webp`.
Seraya tidak memiliki folder `public/assets/seraya/` tersendiri; jangan menganggap seluruh aset shared/dummy sebagai milik Seraya.

## 2. Dua puluh tiga tema eksperimen Atelier lainnya

Keduanya yang juga ada dalam kelompok pertama (Celluloid dan Nocturne) tidak dihitung dua kali.
Definisi bersama: `frontend/src/components/templates/atelier/atelierThemes.js`, `atelierBlueprints.js`, `AtelierTemplate.jsx`, `atelier.css`.

| ID | Nama | Berkas ilustrasi/thumbnail tersisa |
|---|---|---|
| `daguerre` | Daguerre | `daguerre-key-visual-v1.webp` |
| `kodachrome` | Kodachrome | `kodachrome-key-visual-v1.webp` |
| `maison` | Maison | `maison-key-visual-v1.webp` |
| `gatsby` | Gatsby | `gatsby-key-visual-v1.webp` |
| `bauhaus` | Bauhaus | `bauhaus-key-visual-v1.webp` |
| `helvetica` | Helvetica | `helvetica-key-visual-v1.webp` |
| `monolith` | Monolith | `monolith-key-visual-v1.webp` |
| `vellum` | Vellum | `vellum-key-visual-v1.webp` |
| `hanami` | Hanami | `hanami-key-visual-v1.webp` |
| `hanji` | Hanji | `hanji-key-visual-v1.webp` |
| `zellige` | Zellige | `zellige-key-visual-v1.webp` |
| `mughal` | Mughal | `mughal-key-visual-v1.webp` |
| `safavid` | Safavid | `safavid-key-visual-v1.webp` |
| `songket` | Songket | `songket-key-visual-v1.webp` |
| `ulos` | Ulos | `ulos-key-visual-v1.webp` |
| `puspa-sunda` | Puspa Sunda | `puspa-sunda-key-visual-v1.webp` |
| `taksu` | Taksu | `taksu-key-visual-v1.webp` |
| `samudra` | Samudra | `samudra-key-visual-v1.webp` |
| `astralis` | Astralis | `astralis-key-visual-v1.webp` |
| `herbarium` | Herbarium | `herbarium-key-visual-v1.webp` |
| `storybook` | Storybook | `storybook-key-visual-v1.webp` |
| `cathedral` | Cathedral | `cathedral-key-visual-v1.webp` |
| `chrome` | Chrome | `chrome-key-visual-v1.webp` |

Sebagian preset backend Atelier masih tersimpan di `backend/src/utils/themePresets.js`, walaupun bukan pilihan katalog saat ini.

## 3. Sepuluh preset generasi lama

Masih ditemukan di preset backend. Tidak ditemukan folder komponen mandiri dengan ID tersebut pada struktur template saat ini.

**Botani** (`botani`), **Natura** (`natura`), **Exclusive Olan** (`exclusive-olan`), **Emerald** (`emerald`), **Sapphire** (`sapphire`), **Casamie** (`casamie`), **Genby** (`genby`), **Velvet** (`velvet`), **Lumiere** (`lumiere`), **Rustica** (`rustica`).

## Rekapitulasi

- 9 implementasi template lama.
- 23 ID eksperimen Atelier tambahan (25 Atelier dikurangi 2 ID yang sudah dihitung).
- 10 preset generasi lama.
- Total **42 ID template/preset lama**; bukan 42 folder implementasi lengkap.

## Area pembersihan setelah mapping disepakati

1. Kode 9 template lama serta kode template Atelier yang tidak lagi dibutuhkan.
2. Folder ilustrasi khusus 8 tema lama yang masih ada: `eternal`, `nawasena`, `isvara`, `lanqing`, `celluloid`, `nocturne`, `edena`, `yunshui`.
3. Thumbnail lama pada `frontend/public/assets/theme-thumbnails/`, serta bingkai foto khusus tema lama.
4. Entri katalog, preset backend, lazy import/renderer dan daftar ID kompatibilitas untuk tema lama.
5. Modul `templates/depth` dan `templates/depth-v2` setelah referensi pemakainya dilepas; keduanya berbeda dari engine Immersia 1–3.
6. Contoh/fixture/kontrak khusus tema lama yang sudah tidak relevan.

## Batas yang penting

- `frontend/src/components/atelier/` dan `frontend/src/styles/atelier.css` merupakan UI situs/dashboard; berbeda dari `components/templates/atelier/`. Jangan menghapusnya sebagai template lama.
- Aset landing page, musik, galeri contoh, font, shared UI dan komponen fitur tidak otomatis ikut dihapus.
- Thumbnail enam template Immersia berada dalam folder template masing-masing dan harus tetap ada.
- Fallback tema saat ini masih memakai Eternal pada beberapa jalur. Alihkan ke template Immersia sebelum membuang renderer Eternal.
- Mapping ini belum memeriksa berapa undangan tersimpan yang masih memakai ID lama. Penanganan ID lama harus dibuat eksplisit agar undangan tidak blank setelah pembersihan.
- Tidak menyentuh unggahan pengguna, database, atau bucket R2 pada tahap inventaris ini.
