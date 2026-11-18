# Edit manual Anam Garden

Nama di katalog sudah menjadi **Anam Garden**. ID internal dan folder tetap `garden-canvas` agar undangan yang sudah tersimpan tidak perlu dimigrasikan.

## Mulai dari satu file

Edit `frontend/public/templates/viridarium/custom.css`. File ini dimuat terakhir, jadi cocok untuk menambah ukuran font, jarak, ukuran tombol, atau menyembunyikan dekorasi. Simpan lalu refresh pratinjau; perubahan file di folder public kadang memerlukan refresh manual.

Contoh (salin aturan yang diperlukan):

```css
/* Nama pasangan di sampul */
#cover h1 {
  font-size: 64px !important;
}

/* Nama pasangan di hero setelah sampul dibuka */
.hero-heading h2 {
  font-size: 58px !important;
}

/* Tombol buka undangan */
#open {
  font-size: 15px;
  padding: 18px 30px;
}

/* Hilangkan kalimat kecil di bawah tombol sampul */
.cover-note {
  display: none !important;
}

/* Hilangkan label pratinjau */
.demo-tag {
  display: none !important;
}

/* Ukuran khusus HP */
@media (max-width: 600px) {
  #cover h1 {
    font-size: 48px !important;
  }
}
```

`px` adalah ukuran tetap. `clamp(42px, 9vw, 64px)` memberi ukuran yang mengikuti layar, dengan batas minimum/maksimum. Ukuran layar yang dibaca CSS template adalah ukuran area pratinjau/iframe, bukan seluruh dashboard.

## Peta file

| Yang diubah | File |
|---|---|
| Font, jarak, ukuran, elemen dekorasi yang disembunyikan | `frontend/public/templates/viridarium/custom.css` |
| Struktur HTML dan nama kelas/ID elemen | `frontend/public/templates/viridarium/index.html` |
| Desain asli sampul | `frontend/public/templates/viridarium/cover.css` |
| Desain asli hero | `frontend/public/templates/viridarium/hero.css` |
| Kutipan dan detail mempelai | `frontend/public/templates/viridarium/arrum.css`, `couple-details.css` |
| Bagian di empat ruang dan awan | `frontend/public/templates/viridarium/four-rooms.css`, `world-journey.css`, `immersive-garden.css`, `cloud-backdrops.js` |
| Gambar ilustrasi dan background | `frontend/public/templates/viridarium/assets/` |
| Pilihan file gambar, ukuran/posisi pasangan, koordinat dan durasi kamera, teks bawaan | `frontend/src/components/templates/viridarium/defaultConfig.json` |
| Pemetaan nama, acara, galeri, dan data dashboard ke template | `frontend/src/components/templates/viridarium/adapter.js` |
| Isi bagian dinamis seperti acara, galeri, dan RSVP | `frontend/public/templates/viridarium/host-bridge.js` |
| Cara kamera berpindah bagian | `frontend/public/templates/viridarium/hero-scene.js` |
| Gerakan pembuka dan kembali ke sampul | `frontend/public/templates/viridarium/app.js`, `cover-scene.js` |
| Nama dan deskripsi di katalog | `frontend/src/config/themeCatalog.js` |

## Ukuran gambar dan kamera

Di `defaultConfig.json`:

- `layout.coverWidth` / `heroWidth`: ukuran pasangan dalam ruang kamera.
- `layout.coverX`, `coverY`, `heroX`, `heroY`: posisi pasangan.
- `assets.room1` sampai `room4`: background masing-masing ruang.
- `assets.coverCouple` / `heroCouple`: ilustrasi pasangan sampul/hero.
- `cameras`: posisi kamera per bagian, untuk `mobile` dan `wide`.
- `motion.sameRoomMs` / `crossRoomMs`: durasi perpindahan dalam/melintasi ruang. Nilainya milidetik.

Ukuran layer tidak selalu sama dengan piksel di layar karena dipengaruhi jarak kamera. Untuk sekadar membesarkan teks, gunakan CSS dulu.

## Teks dan elemen

Nama mempelai, tanggal, profil, dan informasi undangan berasal dari data dashboard. Teks bawaan berada di bagian `copy` pada `defaultConfig.json`; beberapa nilai sengaja ditimpa oleh `adapter.js` memakai data undangan. `config/invitation.json` di folder public adalah baseline runtime/validasi; untuk pengaturan yang dikirim aplikasi, mulai dari `defaultConfig.json` di folder src.

Untuk menyembunyikan dekorasi, gunakan CSS di `custom.css`. Untuk menonaktifkan satu bagian utuh, gunakan **Susunan & Blok** agar navigasi kamera ikut melewatinya.

Jangan langsung menghapus node HTML, mengganti ID, atau menambah/menghapus potongan teks di `index.html`: engine saat ini mencocokkan node teks dengan daftar `copy`, dan skrip kamera mencari ID tertentu. Perubahan struktur perlu sekaligus memperbarui binding di `bootstrap.js`, daftar `copy` di kedua konfigurasi, dan skrip terkait. Mengubah ukuran atau menyembunyikan lewat CSS tidak mengubah jumlah node teks.
