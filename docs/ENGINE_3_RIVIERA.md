# Engine Landscape — standar template Immersia engine 3

Riviera memakai satu dunia berlapis dan satu kanvas WebGL sejak sampul sampai penutup. Empat area lukisan (taman, sungai, jembatan, danau) dipasang permanen berdampingan dalam koordinat dunia yang sama, dengan sambungan tepian lembut. Tidak ada pergantian latar yang mengikuti section. Ini adalah ilustrasi 2.5D dengan parallax, bukan lingkungan volumetrik yang dapat dilihat dari belakang.

## Pemisahan mesin dan tema

**Mesin bersama** ada di `frontend/public/templates/mental-canvas-3/`:

- `world.js`: validasi kontrak peta, pembingkaian landmark terhadap ukuran viewport, posisi karakter, dan perencanaan lintasan kamera.
- `journey.js`: satu renderer, input scroll/sentuh/keyboard, navigasi dot, pengungkapan teks, dan perjalanan kembali ke sampul.
- `layout.css`: tata letak dasar dan posisi panel yang dipakai lintas tema.
- `bootstrap.js`: membaca konfigurasi konten dan peta milik tema, lalu menyambungkan komponen bersama (musik, galeri, RSVP, dan seterusnya).

**Tema Riviera** ada di `frontend/public/templates/riviera/`:

- `landscape.json`: seluruh area, koordinat, landmark, titik berhenti, karakter, dan dekorasi.
- `assets/landscape-{garden,river,bridge,lake}.webp`: empat ilustrasi persegi yang dirancang untuk pembingkaian portrait.
- `landscape.css`: mengimpor layout standar; override tampilan Riviera diletakkan di sini.
- `bootstrap.js`: hanya mengimpor loader standar; tidak memuat logika perjalanan sendiri.
- `config/invitation.json`: default konten dan daftar aset. Salinan React-nya adalah `frontend/src/components/templates/riviera/defaultConfig.json`; keduanya harus sama.

Komponen React `frontend/src/components/templates/riviera/RivieraTemplate.jsx` menyambungkan pack konten ke studio. ID katalog tetap `riviera`.

## Cara membuat tema landscape baru

1. Buat folder public tema baru dengan struktur Riviera: `index.html`, `bootstrap.js`, `landscape.css`, `landscape.json`, `config/invitation.json`, dan `assets/`.
2. Pertahankan ID section/form bersama pada HTML agar adapter, dot, galeri, musik, dan RSVP tetap bekerja. Ganti aset dan teks melalui konfigurasi.
3. Isi `landscape.json` dengan peta tema baru. Nama area bebas; tidak harus garden/river/bridge/lake.
4. Daftarkan semua kunci aset area/dekorasi dalam `assets` pack konten. Path lokal seperti `/templates/nama-tema/assets/gambar.webp` didukung kontrak engine 3.
5. Buat wrapper React dengan `ViridariumTemplate`, `scenePack` baru, serta `entryPath` baru. Tambahkan tema ke katalog, preset backend/frontend, renderer pratinjau, dan kemampuan Immersia seperti prosedur template lain.
6. Jalankan tes dan cek HP/desktop. Mesin, kurva kamera, input, serta komponen konten tidak perlu disalin atau diubah.

## Kontrak peta versi 1

`version: 1` dan `id` mengidentifikasi peta.

### world

`width`, `height`, `z`, dan `asset` menyatakan batas dunia dan underpainting yang selalu berada di belakang seluruh area. Lebar/tinggi wajib sesuai rasio aset sumber. Underpainting Riviera 3:1 berukuran dunia 43.200 × 14.400. Gambar tidak diregangkan.

### areas

Daftar area dalam urutan kiri ke kanan:

- `id`: unik, dirujuk section dan dekorasi.
- `asset`: kunci aset pada pack konten, bukan URL yang ditulis ke kode mesin.
- `x`, `y` (opsional): pusat area dalam koordinat dunia.
- `width`, `height`: ukuran bidang, wajib mengikuti rasio gambar asli. Riviera memakai bidang persegi 9.600 × 9.600.
- `feather`: tepi horizontal yang dilembutkan, sebagai proporsi gambar. Riviera 0,15. Area tetangga harus bertumpang tindih, bukan menyisakan celah.
- `landmark: {x,y,width,height}`: kotak objek utama dalam koordinat gambar 0–1. Misalnya jembatan utuh. Harus mencakup kedua ujung objek, bukan hanya pusatnya.

Area selalu terpasang dan tidak berubah opacity ketika section berganti. Shader hanya melembutkan tepian gambar secara statis. Canvas 2D memakai masker statis yang dibuat sekali sebagai fallback.

### stops

- `id`: ID section, termasuk `cover`, `hero`, dan `penutup`.
- `area`: area tempat section berada.
- `x`, `y`: offset titik kamera dalam koordinat dunia.
- `z`: jarak kamera untuk section yang menyorot detail/pasangan.
- `fit: "landmark"`: alternatif `z` untuk memastikan objek utama muat pada kedua sumbu viewport. Inilah pengaturan penting agar jembatan tidak terpotong di HP.
- `panel: "top"` (opsional): menempatkan teks di bagian atas agar landmark di bawahnya tetap terlihat. Default `center`.
- `minZ` (opsional): batas jarak terdekat bagi pembingkaian landmark.

Koordinat dunia tetap sama di HP dan desktop. Jarak kamera menyesuaikan viewport dan ukuran landmark. Teks menyesuaikan CSS, bukan dibakar ke gambar.

### characters dan decorations

`characters` memiliki slot `cover`, `hero`, dan `closing`, masing-masing mengacu ke `stop`, `y`, `z`, serta `width` baseline opsional. Pengaturan ukuran, posisi, dan kepala dari studio tetap diterapkan. Skala penutup menjaga posisi kaki terhadap baseline.

`decorations` berisi `id`, `asset`, `area`, `x`, `y`, `z`, `width`, serta `sway` opsional. Ilustrasi menjaga rasio sumber. Dekorasi dengan `attachment: {slot:"closing",floorOffset:420}` mengikuti posisi kaki pasangan, seperti jalur batu di penutup.

## Ritme perjalanan

`motion.overviewHoldMs` pada peta mengatur waktu menikmati panorama. Default 650 ms; rentang yang didukung 0–3.000 ms. Durasi ini mengikuti `motion.durationScale` (default 1.6, rentang 0.5–3). Perpindahan dalam satu area minimal 3.6 detik; lintas area maksimal 14 detik. Sampul masuk 4.8 detik dan kembali langsung 1,6 detik. Reduced motion tetap 180 ms.

Dalam satu area, kamera bergerak langsung dan tenang antar-detail. Ketika berpindah area, mesin:

1. menyembunyikan teks;
2. mundur untuk membuka pemandangan asal;
3. menelusuri area perantara dalam koordinat dunia yang sama;
4. berhenti singkat pada panorama tujuan;
5. mendekati titik baca dan memunculkan teks.

Lompatan dot yang jauh tetap melewati pemandangan perantara. Perjalanan balik bekerja dalam arah sebaliknya. Preferensi reduced motion memakai transisi singkat tanpa tur zoom. Perpindahan tab menjeda waktu perjalanan; musik tetap mengikuti pengendali bersama.

## Batas aset dan pengecekan

Empat gambar area disimpan sebagai WebP 1024 × 1024, sekitar 205–234 KiB per gambar. Aset diunggah sekali untuk seluruh perjalanan; tidak ada pemuatan ulang di tiap section. Panorama lama menjadi underpainting, dan bunga, karakter, musik serta jalur batu tetap digunakan.

Peta divalidasi sebelum rendering. Saat gambar selesai dimuat, rasio sumber juga diperiksa agar ukuran bidang tidak menyimpang dari gambar. [Prompt dan lokasi aset](ENGINE_3_ART_PROMPTS.md) dicatat terpisah.

- Produk: `/sandbox?theme=riviera`
- Pengujian WebGL tanpa data akun: `/tests/fixtures/landscape-engine-check.html`
- Pengujian fallback 2D: `/tests/fixtures/landscape-engine-check.html?renderer=canvas`
- Tes: `npm --prefix frontend run test:templates`
- Build: `npm --prefix frontend run build`

Tes landscape mencakup pembingkaian landmark, batas gambar pada HP dan desktop, lintasan maju/mundur, reduced motion, validasi peta, urutan section, serta penggunaan peta bertema lain tanpa mengubah mesin.

## Sapuan ivory dan mode coba

`mental-canvas-3/reading-washes.js` membuat lapisan pigment terpisah di belakang setiap panel. Ukuran dan pusatnya mengikuti kotak panel yang sesungguhnya, termasuk panel profil di samping, posisi atas, RSVP yang dapat digulir, dan penutup. Lapisan ikut fade bersama teks, tetapi tidak terkena clipping scroll panel. `layout.css` mengatur warna, plateau opacity, dan tepian blur; pendekatan ini mengikuti lapisan pigment Viridarium.

Mode coba memakai `ProfilPanel` dan `CharacterPanel` yang sama dengan studio, dengan penyimpanan lokal. Sampul, hero, serta penutup dapat diatur langsung. Ilustrasi lokal diproses menjadi WebP; saat memilih Daftar & Simpan, `sandboxImport.js` mengunggah ilustrasi ke undangan yang baru dibuat, menyimpan kemajuan agar percobaan ulang tidak menggandakan unggahan.

Riviera dan Wasesa tersedia di katalog `/api/themes/presets`, pilihan tema awal dashboard, studio, dan renderer undangan publik. Tidak diperlukan perubahan status publikasi untuk sekadar memilih tema.

### Profile framing (2026-11-01)
All Immersia engines use `shared/profile-framing.js` for bride/groom profiles. `world.profileCamera()` supplies the landscape character plane; the room engines supply their own plane. The decoded image height determines a full-body framing with head and feet inside the central 72% of viewport height. Head markers only choose the horizontal subject; they must not determine close-up zoom. `heroBrideHeadX/Y` and `heroGroomHeadX/Y` remain numeric layout fields so full configuration and live placement preserve editor markers.

The hero's ivory pigment is the shared `.hero-heading::before` surface. Only the fullscreen `.hero-content` panel pseudo-elements are suppressed; hiding the nested heading pseudo-element removes the text's readable background.

### Shared pair artwork only
Profiles reuse the existing hero pair texture, including uploaded artwork. There are no independent profile assets, extra uploads, masks or image swaps. `fullBodyProfileCamera()` keeps the full image height inside the safe vertical area and positions the selected marker near the outside edge (8% for the right-hand person, 92% for the left-hand person), moving the other partner toward/beyond that edge. Adjust framing/markers rather than adding generated people. Closely overlapping figures remain physically part of one illustration; do not silently replace their artwork.
