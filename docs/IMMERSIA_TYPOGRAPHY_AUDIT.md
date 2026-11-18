# Audit tipografi — 3 November 2026

Lingkup: perilaku editor, runtime bersama seluruh template, dan penghubung iframe Immersia. Tidak mengubah ukuran/font bawaan template. Pemeriksaan visual satu per satu tetap bagian pemilik proyek.

## Sudah lolos sebelum perbaikan baru

- Ukuran kutipan, heading mempelai wanita, dan heading mempelai pria terpisah melalui scope masing-masing.
- Penggabungan preview memprioritaskan tipografi terbaru, bukan snapshot tipografi dari draft konten lama.
- Reset satu scope tidak mengubah scope lain.

Temuan tersebut berdasarkan pengujian terarah, bukan pernyataan bahwa seluruh tampilan/perangkat sudah diperiksa.

## Masalah yang diperbaiki

1. Runtime hanya memilih elemen dengan node teks. Input dan textarea tidak mempunyai node teks untuk nilainya, sehingga jenis huruf dan ukuran isian tidak diterapkan. Kini input, textarea, dan select diproses sebagai teks isi.
2. Slider lebar form dan jarak isian sudah ada di editor, tetapi runtime iframe Immersia belum menerapkannya. Kini lebar/gap form serta fieldset diterapkan dan reset mengembalikan inline style bawaan.
3. Scope ucapan dan daftar ucapan belum diberi penanda pada form iframe. Kini rsvp, wishes, dan wishList dapat diatur terpisah seperti komponen formulir non-iframe.
4. Editor menampilkan ukuran global lama meskipun metricsMode template membuat runtime mengabaikannya. Kini editor/runtime menggunakan resolver yang sama: mode template tampil 100%, override hanya di bagian terpilih. Jarak baris/huruf yang masih mengikuti template ditandai Bawaan, tanpa mengklaim angka perkiraan sebagai nilai aktual.
5. Mengubah ukuran saja tidak lagi memaksakan jarak baris/huruf generik pada bagian tersebut. Hanya properti yang benar-benar diubah yang menimpa CSS template.
6. Observer runtime juga menangani perubahan karakter teks, bukan hanya penambahan/penghapusan elemen.

## Validasi

`node --test frontend/tests/typography-scopes.test.js`

5 pengujian lolos: scope kutipan/profil/reset; penggabungan preview saat simpan; mode template vs nilai slider lama; ukuran dan font isian; ukuran form, scope ucapan, serta pemulihan style saat reset. JSX TypographyPanel dan sintaks runtime/host bridge diperiksa. Tidak memakai akun/data undangan pengguna untuk pengujian ini.

File utama: TypographyPanel.jsx, shared/typography-settings.js, shared/typography-runtime.js, shared/runtime/host-bridge.js.
