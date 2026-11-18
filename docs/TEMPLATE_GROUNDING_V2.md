# Revisi komposisi dan skala v2 — 34 template

Promenade (`urban-editorial`) memakai panorama kota modern: boulevard, skyline, zebra crossing, halte dan kafe. Chromatica (`mural`) memakai studio mural abstrak dengan lantai, furnitur dan teras. Nocturne (`monokrom`, engine 1) memakai studio modern abu-abu dengan cyclorama dan pencahayaan jendela. Ketiganya dibuat ulang sebagai lukisan cat air, bukan memakai foto referensi sebagai background langsung.

Aset baru WebP berakhir `-v2.webp`; aset lama dipertahankan. Tiap panorama memiliki empat crop persegi dari bidang yang sama. Peta engine 3 diperbarui mengikuti rasio panorama dan posisi crop; tidak meregangkan crop menjadi panorama. Thumbnail katalog menunjuk zona pertama baru.

Seluruh 34 template mendapat offset judul cover/hero +30 CSS px melalui `grounding-v2.css` pada semua breakpoint. Ukuran pasangan dihitung dari batas alpha aset. Posisi bawah dan ukuran karakter disusun ulang; shadow tetap mengikuti kaki. Adapter host mempertahankan posisi penutup yang telah ditulis, kemudian menambahkan perubahan slider pengguna, bukan menghapus posisi dasar.

11 template baru engine 1 memakai mode `grounded-environment`: hanya latar, pasangan dan contact shadow pada panggung. Tiang, ground overlay dan bingkai dedaunan kotak tidak dimuat sebagai objek melayang. Frame/canopy di hero juga dibuat tak terlihat. Pada engine 3, dekorasi tambahan yang menyerupai karpet/tepi gambar dilepas, sementara contact shadow dipertahankan. Engine lama enam template tidak otomatis mendapat mode ini.

Background fitted pada engine 1/2 dapat memilih viewportFill sehingga ukurannya mengikuti jarak kamera saat bergerak. Perubahan opsional ini menjaga tepi latar terisi tanpa meregangkan rasio gambar.

Script authoring: `tools/refine-template-grounding.cjs`; jalankan terakhir setelah authoring komposisi tahap sebelumnya, karena tahap sebelumnya dapat menulis ulang koordinat. Dua salinan JSON setiap template tetap disamakan.

Belum menjalankan build, automated tests atau browser QA sesuai alur pengguna. Ini kalibrasi komposisi dan tinjauan aset; skala benda yang menyatu dalam lukisan tetap memerlukan pemeriksaan visual setiap tema. Tidak menyatakan semua 34 tema telah lolos tinjauan visual.

## Heading offset correction

Engine 3's shared layout uses `translate:none!important`, which canceled the first non-important `translate:0 30px` rule. All 34 packs now use `top:calc(base + 30px)!important` directly in grounding-v2.css, with base 10.5% normally, 8.5% on wide screens, and 7% on short screens. Translation is explicitly disabled to avoid applying the offset twice on other engines. This fixes the CSS cascade; the previous offset was not effective on engine 3 hero.
