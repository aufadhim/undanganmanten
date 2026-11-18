# Sekar Jawa

Template undangan Jawa berbasis mesin empat ruang yang sama dengan Anam Garden. Terdaftar sebagai `sekar-jawa` pada katalog, preset backend, pilihan editor, pratinjau publik, dan Mode Coba. Anam Garden serta template lainnya tetap tersedia.

## Arah visual

1. Regol dan taman keraton — hero, kutipan, serta detail mempelai.
2. Pendopo — countdown, akad/resepsi, dan rundown.
3. Pelataran melati — cerita, galeri, dress code, livestream, serta Instagram.
4. Taman lentera — hadiah, RSVP/ucapan, dan penutup.

Pasangan ilustratif memakai beskap, kebaya, batik sogan, blangkon, serta ronce melati. Pose sampul saling menatap, pose hero menghadap tamu. Warna utama ivory hangat, olive, cokelat sogan, serta emas kusam. Gambar penutup dibuat lebih samar agar teks tetap terbaca.

## File untuk edit manual

- `frontend/public/templates/sekar-jawa/custom.css`: font, ukuran, jarak, warna, dan elemen yang disembunyikan. Aturan HP berada di media query `max-width:899px`.
- `frontend/src/components/templates/sekar-jawa/defaultConfig.json`: teks bawaan, pilihan ilustrasi/background, posisi pasangan, dan titik/durasi kamera. `layout.closingOpacity` mengatur ketebalan pasangan pada penutup.
- `frontend/public/templates/sekar-jawa/assets/`: tujuh ilustrasi baru WebP.
- `frontend/public/templates/sekar-jawa/index.html`: struktur halaman; jumlah node teks tetap mengikuti binding engine.
- `frontend/src/components/templates/sekar-jawa/SekarJawaTemplate.jsx`: pendaftaran paket ke mesin bersama.

Engine, awan, formulir, QR, kontrol musik, dan navigasi memakai runtime bersama di `frontend/public/templates/viridarium/`. CSS manual Anam Garden (`garden-canvas/custom.css`) tidak dimuat oleh Sekar Jawa. Konfigurasi kedua template terpisah; tidak perlu menyalin seluruh engine untuk membuat variasi ilustrasi baru.

## Aset dan prompt

Ilustrasi dibuat dengan **imagegen bawaan**, lalu salinan final dikonversi ke WebP maksimal 960×1440 sambil mempertahankan transparansi. Total tujuh ilustrasi baru **1.98 MiB**. Tidak ada PNG resolusi penuh yang dibebankan ke website. Musik dan awan dipakai ulang, tidak diduplikasi.

Set prompt final dan referensi pose berada di `prompts.json`. Daftar file, ukuran, transparansi, serta nama sumber generasi berada di `assets.json`. Ilustrasi bersifat konseptual, bukan dokumentasi arsitektur/sejarah yang presisi.

## Pemeriksaan

- Build berhasil; 22 tes frontend dan 29 tes backend lulus.
- 103 referensi aset literal hasil build diperiksa tanpa file hilang; setiap aset pada scene pack juga diuji.
- Browser: sampul, transisi menuju hero, pendopo, penutup, dan kembali ke sampul diuji. Pergantian Anam Garden → Sekar Jawa tidak memunculkan fallback error.
- Lebar 390px diperiksa tanpa halaman melebar.
- Belum dipublikasikan; pratinjau lokal ada di http://127.0.0.1:4175/sandbox?theme=sekar-jawa .
- Pengujian tidak mengubah undangan asli atau mengirim data tamu ke database. Pengiriman formulir dan kontrol musik memakai jalur engine yang sudah ada.


## Palet sogan maroon v2

Sekar Jawa kini memakai coklat tua `#3b241d`, maroon `#722a35`, antique gold, dan parchment `#f1e3cc`. Ketujuh ilustrasi aktif diwarnai ulang dengan built-in image_gen, termasuk empat ruang, kanopi transparan, dan dua pose pasangan. Komposisi dan jalur kamera dipertahankan.

Asset aktif: `frontend/public/templates/sekar-jawa/assets/*-maroon-v2.webp`. Total 2.06 MiB, sisi panjang maksimal 1440 px. Versi lama tetap tersedia sebagai sumber cadangan. Prompt dan path sumber tersimpan di `prompts-maroon-v2.json`.

Validasi: 22 tes frontend, 29 tes backend, build dan pemeriksaan seluruh URL asset berhasil.


## Dusty watercolor v3

Semua 7 ilustrasi Sekar Jawa diperhalus dengan built-in image_gen: maroon dusty, taupe/cocoa lembut, linen ivory dan champagne gold matte, detail kuas lebih longgar, kontras dan saturasi lebih rendah. File aktif memakai suffix `-dusty-v3.webp`; versi sebelumnya tetap tersedia sebagai cadangan. Total 1.86 MiB. Prompt dan sumber: `prompts-dusty-v3.json`. Palet teks/tombol pada preset frontend, backend dan panel Warna juga diselaraskan.

Teks utama tetap coklat `#594942` untuk keterbacaan; tombol dusty maroon `#896865`. Alas teks memakai ivory wash bersama dengan rendering yang lebih netral. Penyesuaian warna tampilan hanya pada `.sekar-jawa .garden-renderer`, tanpa blur dan tanpa mengubah template lain.
