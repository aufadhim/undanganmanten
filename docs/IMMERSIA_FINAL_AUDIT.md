# Audit akhir Immersia — 3 November 2026

## Perubahan

- Immersia sekarang melalui SplitViewLayout, sama seperti jalur template lainnya. Undangan tetap mobile: maksimum 450 px, wallpaper mengikuti tema di sisi kiri mulai lebar container 700 px. Kolom undangan memakai 25% lebar dengan minimum 320 px agar tablet tetap terbaca.
- Tinggi undangan publik memakai 100dvh untuk mengikuti area layar browser mobile.
- Musik latar tidak boleh kembali berbunyi saat video galeri atau livestream masih terbuka, termasuk setelah fokus aplikasi kembali. Menutup pemutar tetap menghormati pilihan jeda manual tamu.
- Background blur tambahan pada sisi undangan Immersia dinonaktifkan; gambar wallpaper memakai aset tema yang sudah tersedia.

## Verifikasi yang dijalankan

Fixture lokal: `frontend/tests/fixtures/immersia-final-check.html`. Fixture memakai data dan penyimpanan lokal terpisah; tidak menulis ke API, Neon, atau R2.

| Lebar perangkat simulasi | Lebar iframe terukur |
| --- | --- |
| 390 px | 390 px |
| 768 px | 319 px |
| 1024 px | 319 px |
| 1440 px | 359 px |

Selisih 1 px pada kolom lebar berasal dari border. Wallpaper muncul pada ukuran tablet/desktop. Nama uji tersimpan dan tetap ada setelah reload fixture. Pembukaan sampul dan navigasi engine 1/2/3 diperiksa di browser; galeri membuka lightbox, tombol berikutnya/sebelumnya dan tutup bekerja. Form RSVP menampilkan judul, subtitle, ucapan, serta hasil simulasi berhasil tanpa menyimpan tamu sungguhan.

33 pemeriksaan terarah lulus: draft/reload, keenam layout galeri, pemisahan foto-video, musik/fokus/pemutar, tipografi per bagian dan reset, transaksi profil+pengaturan, transaksi RSVP+ucapan, validasi dan hak akses. Pemeriksaan backend menggunakan mock transaksi; bukan koneksi database produksi. Lima file JSX yang disentuh juga lolos pemeriksaan sintaks.

## Batas bukti

Ini audit lokal komponen bersama, bukan pemeriksaan visual seluruh 40 template. Pemeriksaan visual per template tetap dilakukan pemilik. Belum dilakukan benchmark pada HP/iPad fisik atau pengiriman ulang ke Neon dengan akun pengguna nyata. Tidak ada deployment atau perubahan undangan pengguna dalam audit ini.
