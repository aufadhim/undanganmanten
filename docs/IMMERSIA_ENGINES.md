# Engine Immersia bersama

## Engine 1: Rooms

Komponen pemanggil: `frontend/src/components/templates/engines/rooms/RoomsEngine.jsx`.
Runtime perjalanan kamera khusus engine 1: `frontend/public/templates/engines/rooms/`.

13 template engine 1 memanggil komponen ini dengan `scenePack`, `entryPath`, dan `templateName` masing-masing. Viridarium sekarang juga pemakai; bukan lagi tempat menyimpan kode engine.

Contoh:

```jsx
import RoomsEngine from '../engines/rooms/RoomsEngine.jsx';
import scenePack from './defaultConfig.json';
export default function ExampleTemplate(props) {
  return <RoomsEngine {...props} scenePack={scenePack}
    entryPath="/templates/example/index.html" templateName="Example" />;
}
```

## Tanggung jawab

- `RoomsEngine.jsx`: pintu masuk engine 1.
- `frontend/src/components/templates/engines/shared/ImmersiaHost.jsx`: jembatan React/iframe yang dipakai bersama seluruh Immersia; galeri, RSVP, hadiah, musik, pengiriman data, dan pembaruan preview tidak diduplikasi.
- `frontend/src/components/templates/engines/shared/adapter.js`: pemetaan data undangan ke konfigurasi runtime bersama.
- `frontend/public/templates/shared/runtime/scene-engine.js`: renderer kamera/canvas bersama engine 1 dan 3.
- `cover-scene.js`, `hero-scene.js`: perjalanan engine 1.
- `bootstrap.js`: memuat konfigurasi dari URL dokumen template, bukan dari folder engine.
- `shared/template-scenes/<folder>.json`: konfigurasi adegan milik template; sumber edit tunggal.
- `frontend/public/templates/<folder>/assets/`, `custom.css`, dan `index.html`: aset, gaya khusus, dan markup milik template.
- Animasi foliage Viridarium tetap di folder Viridarium karena merupakan ornamen khusus.

## Engine 2: Book

Komponen pemanggil: `frontend/src/components/templates/engines/book/BookEngine.jsx`.
Runtime: `frontend/public/templates/engines/book/`.

13 template engine 2 (Pramaya serta 12 template koleksi baru) memanggil `BookEngine` dengan scene pack masing-masing. `book-portal.js`, `book-portal-renderer.js`, dan `portal-math.js` mengatur masuk/keluar buku; `cover-scene.js`, `hero-scene.js`, dan `garden-theme.js` mengatur perjalanan di dalamnya. `portal.css` adalah gaya engine; ilustrasi buku dan pemandangan tetap berasal dari konfigurasi template.

Folder lama `mental-canvas-2/` sudah dipindahkan, bukan disalin. Referensi runtime HTML dan impor pengujian yang sudah ada mengikuti lokasi baru. Nama internal `data-engine="mental-canvas-2"` dipertahankan untuk kompatibilitas perilaku; itu bukan path sumber.

Host React dan adapter berada di `frontend/src/components/templates/engines/shared/` dan digunakan oleh ketiga engine. Engine 2 juga memakai utilitas konfigurasi, musik, dan sapuan ivory dari `frontend/public/templates/shared/runtime/`; tidak dibuat salinan baru.

## Engine 3: Landscape

Komponen pemanggil: `frontend/src/components/templates/engines/landscape/LandscapeEngine.jsx`.
Runtime: `frontend/public/templates/engines/landscape/`.

14 template engine 3 memakai komponen ini, termasuk Riviera, Wasesa, dan Ludora. `world.js` menghitung dunia landscape dan kamera; `journey.js` menggerakkan perjalanan; `cover-motion.js` mengatur animasi kamera sampul; `reading-washes.js` dan `layout.css` mengatur area baca. Folder lama `mental-canvas-3/` sudah dipindah, bukan disalin.

Setiap template tetap menyediakan konfigurasi undangan, `landscape.json`, aset, dan gaya khusus. `landscape.json` adalah keluaran dari properti `landscape` di `shared/template-scenes/<folder>.json`. Bootstrap mengambil konfigurasi dan peta relatif ke halaman template, sehingga tidak membaca peta template lain.

## Ringkasan struktur akhir

| Engine | Komponen | Runtime | Jumlah template |
|---|---|---|---|
| 1 | `engines/rooms/RoomsEngine.jsx` | `public/templates/engines/rooms/` | 13 |
| 2 | `engines/book/BookEngine.jsx` | `public/templates/engines/book/` | 13 |
| 3 | `engines/landscape/LandscapeEngine.jsx` | `public/templates/engines/landscape/` | 14 |

Path komponen relatif ke `frontend/src/components/templates/`; path runtime relatif ke `frontend/`. Host dan adapter React dipakai bersama dari `engines/shared/`. Renderer, musik, pengaturan teks, dan utilitas yang sudah bersama tetap dipakai lintas engine; pemisahan folder tidak berarti harus membuat salinan utilitas.

Untuk template baru, pilih komponen engine lalu berikan scene pack dan entry path template. Jangan menyalin kode engine ke folder template. 3 template Signature tidak diubah oleh refactor ini.

File `defaultConfig.json` dan runtime `config/invitation.json` tetap hasil generator. Jalankan `npm run templates:sync` setelah mengubah sumber adegan, atau gunakan sinkronisasi mode dev. Rujuk `docs/TEMPLATE_SCENE_SOURCES.md`.

Pemindahan sumber ini tidak mengubah koordinat, ukuran figur, durasi transisi, atau konten undangan. Tidak ada migrasi database atau penghapusan aset. Pada tahap ini hanya dilakukan penelusuran rujukan file dan pemeriksaan sintaks, tanpa tes, build, atau pemeriksaan browser.


## Runtime umum lintas engine

Lokasi: `frontend/public/templates/shared/runtime/`.

- `config-store.js`: membaca/merge konfigurasi dan draft.
- `host-bridge.js`: menerapkan payload editor, konten, dan tata letak secara realtime.
- `music.js`: penghubung audio ke `shared/music-controller.js`.
- `cloud-backdrops.js`: sapuan baca berdasarkan geometri panel; memakai `shared/ivory-wash.js`.
- `scene-engine.js`: renderer bersama engine 1 dan 3.
- `app.js`: navigasi dan interaksi dasar bersama engine 1 dan 3.
- CSS dasar (`style.css`, `host.css`, `cover.css`, `hero.css`, dan lainnya): fondasi tampilan lintas engine; gaya khusus tema tetap di folder template.

Renderer serta navigasi buku di `engines/book/` tetap terpisah karena punya perilaku khusus. `engines/rooms/` kini hanya menyimpan bootstrap, perjalanan sampul, perjalanan hero, dan penyusunan lapisan ruang. Semua sumber CSS/JS yang dipindahkan tetap satu salinan; tidak ada wrapper file lama yang memuat salinan tambahan.

Pengaturan jenis/ukuran font tetap memakai `shared/typography-runtime.js`; fitur galeri, hadiah, RSVP, dan utilitas lain yang sebelumnya sudah ada di `shared/` tidak dipindah lagi. Path CSS dan script di seluruh halaman template mengikuti lokasi runtime baru.
