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

Komponen di `shared/` hanya boleh menangani perilaku generik yang tidak menentukan
tampilan, seperti aksesibilitas dan navigasi lightbox. Setiap template tetap bebas
memiliki markup, komposisi, animasi, dan CSS sendiri untuk RSVP, hadiah, ucapan,
galeri, video, countdown, acara, dresscode, rundown, serta livestream.

Saat membuat template baru:

1. Buat folder komponen dan stylesheet-nya.
2. Daftarkan tema di `templateManifest.js`, `PhonePreview.jsx`, katalog tema,
   pengaturan Mode Coba, palet warna, dan preset backend.
3. Gunakan `templateStyle` yang sama dengan ID tema pada form publik.
4. Pastikan seluruh fitur bisnis pada manifest benar-benar tersambung.
5. Jalankan `npm run test:templates` lalu `npm run build` dari folder frontend.

Tes kelengkapan tidak menyeragamkan desain. Tes hanya memeriksa kontrak data,
fitur bisnis, isolasi selector CSS, integrasi katalog, dan keberadaan preset.
