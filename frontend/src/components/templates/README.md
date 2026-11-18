> Pendaftaran template sekarang melalui `shared/template-registry.json` lalu `npm run registry:sync` di root. Jangan menambah daftar manual pada PhonePreview/katalog/preset. Panduan: `docs/TEMPLATE_REGISTRY.md`. Instruksi lama di bawah hanya konteks struktur template.

# Koleksi yang dipertahankan

Immersia: Viridarium, Sogan, Pramaya, Riviera, Wasesa, Ludora.
Signature: Eternal, Nawasena, Seraya.
34 folder berikutnya masih tahap perencanaan; lihat `docs/TEMPLATE_EXPANSION_PLAN.md`.

# Struktur template undangan

Setiap desain mempunyai folder mandiri:

```text
templates/
  nama-tema/
    NamaTemaTemplate.jsx
    nama-tema.css
  shared/
  templateManifest.js
```

Galeri foto/video menggunakan **StandardGallery** di `shared/StandardGallery.jsx` untuk semua tema.
Aturan visualnya adalah standar produk: enam layout foto (Collage tiga kolom), foto muat
seluruhnya tanpa scroll kecuali Slideshow, video selebar container di baris horizontal
terpisah tanpa caption, dan satu Lightbox gabungan dengan navigasi panah.

Sumber aturan bersama:
- `frontend/public/templates/shared/gallery-layout.js`: susunan, ukuran, pemisahan video.
- `frontend/public/templates/shared/gallery-layout.css`: tampilan thumbnail dan strip video.
- `shared/Lightbox.jsx`: foto/video besar dan navigasi.

Tema Immersia memakai renderer publik yang sama melalui host bridge. Tema React wajib
memakai `<StandardGallery mediaList={media} layout={theme.galleryLayout || 'editorial'} />`.
Latar, judul bagian, dan elemen di luar galeri tetap mengikuti desain masing-masing tema.
Jangan menambahkan implementasi layout galeri sendiri pada template baru.

Saat membuat template baru:

1. Buat folder komponen dan stylesheet-nya.
2. Daftarkan tema di `templateManifest.js`, `PhonePreview.jsx`, katalog tema,
   pengaturan Mode Coba, palet warna, dan preset backend.
3. Gunakan `templateStyle` yang sama dengan ID tema pada form publik.
4. Pastikan seluruh fitur bisnis pada manifest benar-benar tersambung.
5. Jalankan `npm run test:templates` lalu `npm run build` dari folder frontend.

Tes kelengkapan tidak menyeragamkan desain. Tes hanya memeriksa kontrak data,
fitur bisnis, isolasi selector CSS, integrasi katalog, dan keberadaan preset.

### Bingkai Foto

All templates use `shared/PhotoFrame.jsx` (Immersia mounts it with `ImmersiaPhotoFrame.jsx`). The editor is currently `src/components/IGFilterEditor.jsx`. Persisted keys `igFilterEnabled` and `igFilterImageUrl` are retained for compatibility; the old Instagram AR URL is no longer used. The feature remains off by default. Frame uploads require transparent PNG/WebP, are resized to at most 1600 px and retain transparency. Guest photos are composited locally and never uploaded. Remote frame storage must allow cross-origin image loading for canvas export; failures appear in the composer rather than producing an invalid download.

### RSVP & Ucapan

`shared/GuestConfirmation.jsx` is the combined guest form, wrapped by `PublicForms.jsx`; Immersia mounts it with `ImmersiaConfirmation.jsx`. Preview submissions are local simulations and must never call a write endpoint. Live submissions use `POST /invitations/public/:slug/confirmation`, which commits attendance and an optional moderated wish in one serializable transaction. Keep the two feature toggles independent: wishes can be submitted without RSVP when attendance collection is disabled. A declined invitation always records guestCount=0. The separate wishes section is unnecessary while the combined RSVP section is enabled.
