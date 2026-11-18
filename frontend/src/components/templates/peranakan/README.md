> Konfigurasi adegan diedit hanya di `shared/template-scenes/peranakan.json`. `defaultConfig.json`, runtime `config/invitation.json`, dan peta runtime adalah hasil sinkronisasi otomatis. Lihat `docs/TEMPLATE_SCENE_SOURCES.md`.

# Porcelaine

Kerangka engine **2**, disalin dari **pramaya**. Terhubung ke katalog.

Konsep: Peranakan — album kisah keluarga.

- Komponen: `PeranakanTemplate.jsx`.
- Konfigurasi React: `defaultConfig.json`.
- Konfigurasi runtime: `frontend/public/templates/peranakan/config/invitation.json`.
- CSS lokal: `frontend/public/templates/peranakan/custom.css`.
- Ilustrasi: `frontend/public/templates/peranakan/assets/ilustrasi1.webp`, dst.
- Daftar kegunaan setiap ilustrasi: `assets/manifest.json` di folder runtime.

Ilustrasi telah dibuat dalam WebP dengan built-in imagegen. Kegunaan setiap file tercatat dalam manifest aset. Kerangka tetap belum didaftarkan ke katalog; penyesuaian akhir komposisi dilakukan pada tahap berikutnya. Gunakan file yang sama untuk peran yang memakai ilustrasi sama. Utility sapuan ivory, bayangan, musik dan engine tetap dibagi bersama.
Ubah kedua salinan konfigurasi bersama ketika mengubah scene. Nama tampilan: Porcelaine.

## Komposisi sampul dan hero

Skala dan posisi pasangan mengikuti batas figur transparan yang diukur dari ilustrasi lokal.
- Posisi pasangan: `layout` di `defaultConfig.json` dan `config/invitation.json` runtime.
- Ornamen dan framing: `composition` di kedua berkas konfigurasi.
- Posisi teks/responsif: `frontend/public/templates/peranakan/composition.css`.
- Pose sampul ditampilkan pada halaman buku; pose hero digunakan setelah masuk.

Belum diaktifkan di katalog; belum menjalankan pengujian aplikasi atau build.

## Kutipan dan profil

- Teks dan kolom baca: `intro-composition.css` di folder runtime.
- Durasi/reveal dan opacity kutipan: `composition.intro` dalam kedua konfigurasi.
- Framing badan: `layout.profileBody*`, `profileHeight`, `profileFootLine`.
- Penanda kepala tetap memilih sisi orang pada SATU ilustrasi pasangan; tidak menambah ilustrasi profil.
- Gerakan antarprofil mundur ke komposisi pasangan sebelum bergeser ke orang berikutnya.
- Nilai kamera mobile/wide disimpan pada `cameras`; engine 3 juga mempunyai stop dalam `landscape.json`.

## Countdown, acara, dan rundown

- Tata letak: `event-composition.css` di folder runtime.
- Kamera: `cameras` dalam kedua konfigurasi; engine 3 memakai tiga stop dalam area yang sama di `landscape.json`.
- Durasi: `composition.events` (gerakan lokal 4 detik).
- Kalender tetap memakai komponen SaveTheDate; lokasi sama tetap memakai renderEventDetails bersama.
- Rundown mengikuti urutan editor; jam dan nama acara sama-sama 13 px, deskripsi 11 px.
- Teks panjang dapat digulir di panel; tombol lokasi memakai gaya ivory tanpa ikon.

## Cerita, galeri, dress code, livestream, dan bingkai

Tata letak: `social-composition.css`. Kamera: kedua konfigurasi; engine 3 memakai stop satu area pada `landscape.json`. Durasi lokal 4,2 detik melalui `composition.social`. Komponen galeri/lightbox, cerita, dress code, livestream, dan bingkai tetap dipakai bersama. Belum diperiksa di browser.

## Hadiah, RSVP, dan penutup

Tampilan: `final-composition.css`. Perjalanan: `composition.finale`. Hadiah tetap memakai disclosure bersama, RSVP dan ucapan satu ruang gulir. Penutup teks di atas, pasangan bawah; engine 2 tetap kembali ke ruang buku di luar. Belum diperiksa di browser.
