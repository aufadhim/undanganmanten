# Peta engine dan source

| Engine | Konsep | Tema acuan | Source utama |
|---|---|---|---|
| 1 | Beberapa ruang; tiap ruang menampung beberapa bagian. Kamera zoom/pan; teks/dekorasi hide–reveal dalam ruang yang sama | Viridarium (`garden-canvas`), Sogan (`sekar-jawa`) | `frontend/public/templates/viridarium/`, `sekar-jawa/` |
| 2 | Sampul di luar buku; kamera masuk buku secara natural; cerita di dalam; penutup kembali ke ruang luar | Pramaya | `frontend/public/templates/mental-canvas-2/`, `pramaya/` |
| 3 | Satu landscape panjang persisten; landmark dan lapisan x/y/z menyatu; kamera menjelajah koordinat | Riviera, Wasesa, Ludora | `frontend/public/templates/mental-canvas-3/` + masing-masing folder tema |

Nama kategori untuk ketiganya **Immersia**. Eternal/Nawasena/Seraya = **Signature**. Bespoke disimpan untuk layanan desain pesanan. Nawasena adalah inspirasi Wasesa, bukan engine 3 itu sendiri.

## Kontrak runtime bersama
- `frontend/src/components/templates/viridarium/ViridariumTemplate.jsx`: wrapper iframe, integrasi fitur React, lifecycle preview. Dipakai semua Immersia.
- `.../viridarium/adapter.js`: memetakan data invitation/guest/themeSettings menjadi payload engine. Ini sumber kebenaran integrasi CMS.
- `frontend/public/templates/viridarium/host-bridge.js`: handshake `garden:ready` / `garden:configure`, update placement, interaksi host. Pertahankan validasi origin/source dan protocol.
- `.../viridarium/scene-engine.js`: WebGL dan Canvas2D fallback, tekstur, render loop/readiness. Jangan menduplikasi renderer per bagian.
- React `defaultConfig.json` dan public `config/invitation.json` harus selaras. HTML memiliki kontrak ID DOM dan binding teks `copy.tNNN`; perubahan jumlah text node harus diikuti konfigurasi, bukan menghapus HTML secara sembarang.
- Theme wrapper menentukan scenePack dan entryPath. Gunakan wrapper yang sama untuk tema baru.

## Engine 3 terperinci
`world.js`: validasi map, layer, framing/clamp kamera, world origin termasuk world.y, flight interpolation.
`journey.js`: satu renderer, navigasi scroll/swipe/dots, reveal, transisi masuk/kembali.
`layout.css`: layout bersama; `reading-washes.js`: sapuan ivory responsif, hero tidak memakai plate pojok.
`cover-motion.js`: intro dan ambience setelah siap; `bootstrap.js`: pack, map, bridge, copy, modul bersama.

Per tema: `landscape.json` menyimpan world, areas, stops, landmarks, characters, decorations, motion. `landscape.css` berisi visual tema, bukan salinan engine. `assets/` ilustrasi. Jangan mengekstrak satu gambar panorama lalu men-zoom berlebihan: butuh lapisan dan skala subjek yang dirancang untuk viewport HP.

## Modul standar
Public `frontend/public/templates/shared/`: gallery-layout, typography-runtime, live-character-layout, event-layout, story-layout, dresscode, cover-ambience dan journey-route.
React `frontend/src/components/templates/shared/`: komponen fitur bersama; cari Lightbox/StandardGallery, ImmersiaConfirmation/Gift/PhotoFrame/Livestream/SaveTheDate, FooterBrand. Musik memakai kontrol bersama dengan empat bar halus.

## Daftar registrasi (cari ID tema acuan, salin polanya)
Frontend: `src/config/themeCatalog.js`, `themePresets.js`, `templateCapabilities.js`; `src/components/PhonePreview.jsx`, `SandboxTemaPanel.jsx`, `dashboard/DashboardOnboarding.jsx`; `src/pages/Dashboard.jsx`, `SandboxDashboard.jsx`; `src/utils/activeTheme.js`; `MentalCanvasMediaPanel.jsx`, `SusunanPanel.jsx`, `PenutupPanel.jsx`; `src/utils/defaultPhotoFrame.js` serta public photo-frames/thumbnail.
Backend: `src/utils/themePresets.js`, `src/controllers/themeController.js`, `src/utils/adminPolicy.js`, `src/services/characterRenderAssets.js`.
Daftar ini panduan audit, bukan alasan menambah hardcode baru tanpa memeriksa struktur terbaru.

## Skala dan pijakan (pembaruan 1 November 2026)
Baca `docs/TEMPLATE_SPATIAL_SCALE.md`. Contact shadow/resize memakai `public/templates/shared/character-grounding.js`; semua engine Immersia memakainya. Saat membuat tema baru, kalibrasi ukuran orang terhadap paving, tanaman, dan properti pada pose dekat serta panorama. Jangan hanya menyalin koordinat lama ke art pack berbeda.

## Sapuan ivory
Acuan visual Viridarium dipusatkan di `public/templates/shared/ivory-wash.css` dan `ivory-wash.js`. Baca `docs/IVORY_WASH_STANDARD.md` sebelum mengubah opacity, blur, atau luas penyebaran. Jangan menambah lapisan putih baru per tema.
