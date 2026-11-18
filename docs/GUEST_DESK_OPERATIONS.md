# Buku tamu dan akses penerima tamu

## Pemilik
- Buka Tamu & RSVP → Buku tamu & QR setelah add-on aktif.
- Buat akses penerima tamu: beri nama meja/petugas dan durasi 6 jam sampai 7 hari (dibatasi H+30 acara).
- Salin tautan yang ditampilkan sekali. Setiap tautan bersifat rahasia dan memberi akses pencatatan kedatangan; bagikan hanya kepada petugas.
- Akses dapat dicabut dari daftar akses. Tidak perlu membagikan login pemilik.

## Petugas
- Buka tautan `/guest-desk#…`. Token dipindahkan ke sessionStorage tab; tidak disimpan di alamat halaman atau localStorage akun pemilik.
- Hanya daftar nama, kelompok, batas orang dan status kedatangan yang diberikan server; tanpa nomor telepon, ucapan, pembayaran, desain, atau penghapusan tamu.
- Cari nama atau pindai QR → pilih jumlah orang aktual → konfirmasi.
- Pemindaian tidak langsung mencatat hadir. Check-in ganda ditolak server. Pembatalan tersedia untuk koreksi.
- Akses berakhir otomatis dan pencabutan berlaku pada permintaan berikutnya. Daftar diperbarui tiap 30 detik atau lewat Muat ulang.
- Kamera perlu izin dan HTTPS (localhost dapat dipakai untuk pengembangan). Perangkat HP fisik belum diuji pada perubahan ini. Harus online; belum ada mode offline.

## Pembelian
- Paket baru: Rp119.000; dengan QR Rp139.000.
- Paket aktif: checkout ADDON hanya Rp20.000 untuk QR. Tidak menulis ulang paket, masa aktif atau status publikasi.
- Hak QR disimpan pada pernikahan; tetap ada saat desain asal pembelian dihapus. Migrasi menyalin hak dari pembayaran lama yang berhasil.
- Checkout menolak add-on duplikat, hak yang sudah aktif, atau pembelian addon tanpa paket aktif. Permintaan identik memakai kembali order pending bertoken; penerbitan order dikunci per pernikahan.
- Aktivasi tetap hanya dari notifikasi gateway terverifikasi atau aktivasi admin. Callback browser menunggu status server, bukan menandai pembayaran berhasil sendiri.

## Data dan audit
- Tabel baru guest_desk_accesses menyimpan SHA-256 token acak 256 bit, label, pemilik, masa berlaku dan pencabutan.
- Tabel wedding_addons menyimpan hak QR secara mandiri dari order/desain.
- Log: penerbitan/pencabutan akses, check-in dan pembatalannya; tindakan petugas memakai ID akses, bukan identitas akun pemilik.
- Pembatasan akses: maksimal 10 akses aktif per undangan, penerbitan diserialisasi, permintaan petugas dibatasi laju.

## Pemeriksaan
- Unit: checkoutPlan, orderActivationLifecycle, entitlements, weddingGuests, guestReport.
- `backend/tests/guest-desk-smoke.mjs`: akun/pernikahan uji terpisah; scope pernikahan, token hash, penolakan akses akun pemilik, jumlah aktual, check-in ganda, undo, audit, revoke, expiry, serta hak tetap hidup setelah desain sumber dihapus. Data uji dibersihkan setelah selesai.
- Pratinjau UI tanpa penyimpanan: `/tests/fixtures/guest-desk-audit.html`.
- Tidak melakukan transaksi uang atau pengujian kamera fisik.
