# Edit template Viridarium

Folder proyek yang dipakai aplikasi lokal:
`/Users/auf/Documents/ChatGPT/undanganmanten`

## Tempat utama edit CSS

`frontend/public/templates/viridarium/custom.css`

Buka VS Code pada folder proyek di atas. Gunakan Cmd+P lalu tempel path relatif tersebut.
CSS template berada di **frontend/public**, bukan frontend/src.
Jangan mengedit frontend/dist karena itu hasil build.

```css
/* Kutipan */
#arrum-content .arrum-meaning { font-size: 18px; line-height: 1.6; }
/* Nama wanita dan pria */
#bride-detail h2, #groom-detail h2 { font-size: 42px; }
/* Nama pada sampul */
#cover h1 { font-size: 56px; }
```

Ukuran user 100% mengikuti CSS template. Reset bagian di tab Tipografi untuk
melihat default tanpa penyesuaian ukuran yang pernah tersimpan.

## Struktur

- `frontend/public/templates/viridarium/`: HTML, CSS, animasi, config, aset.
- `frontend/src/components/templates/viridarium/ViridariumTemplate.jsx`: penghubung iframe dengan aplikasi.
- `frontend/src/components/templates/viridarium/adapter.js`: pemetaan data undangan.
- `frontend/src/components/templates/viridarium/defaultConfig.json`: konfigurasi scene bawaan.

ID database `garden-canvas` tetap digunakan untuk kompatibilitas undangan lama.
Nama folder dan komponen sudah Viridarium; ID database tidak menentukan path file.
Sogan dan Pramaya memakai sebagian file engine bersama dari folder Viridarium,
tetapi custom.css masing-masing hanya dimuat oleh template itu sendiri.
