# Panel operasional admin

Panel `/admin` menyediakan ringkasan, pengguna, undangan, pembayaran, template, operasional, dan riwayat tindakan. Daftar pengguna/undangan/order/audit memakai pencarian dan paginasi 50 baris. Akun ADMIN dapat beralih ke `/dashboard` untuk undangannya sendiri; batas 3 desain, 150 MiB/100 berkas per akun dan 50 MiB/40 berkas per desain tetap berlaku.

## Kewenangan

Semua endpoint `/api/admin/*` mewajibkan autentikasi dan role ADMIN dari database pada setiap request. Akun ditangguhkan ditolak pada request berikutnya termasuk sesi yang sudah terbit. Admin aktif terakhir tidak dapat didemote atau ditangguhkan; admin tidak dapat menonaktifkan akses dirinya sendiri, dan penghapusan mandiri akun ADMIN ditolak sampai perannya dialihkan. Tidak ada fitur menyamar menjadi pengguna.

Perubahan user, undangan, template, dan aktivasi manual mewajibkan alasan 8–500 karakter. Mutasi database dan audit ditulis dalam transaksi yang sama; audit tidak memiliki endpoint ubah/hapus. Log menyimpan actor, sasaran, waktu, alasan, sebelum/sesudah yang relevan. Tidak menyimpan password hash/token. Pengubahan role diserialisasi dan memeriksa admin aktif terakhir.

## Undangan

Penangguhan menggunakan `suspendedAt`/`suspensionReason`, terpisah dari status publikasi/arsip dan pembayaran. Halaman publik, tautan tamu, kunjungan, RSVP, dan ucapan memeriksa penangguhan undangan/pemilik. Pemilik tidak bisa menerbitkan undangan yang ditangguhkan. Memulihkan penangguhan tidak melewati status publikasi atau masa aktif. Admin dapat menarik publikasi dan memperpanjang 1–365 hari; API tidak menerima publish langsung atau pengubahan paket bebas. Aktivasi paket harus melalui order; publikasi pelanggan tetap melalui checklist.

## Pembayaran

Aktivasi manual memberi akses paket, menyimpan alasan/sumber `manual`, dan bukan omzet gateway. Order sukses tidak diaktifkan dua kali. Webhook terverifikasi setelah aktivasi manual dapat mengonfirmasi sumber gateway tanpa memberikan paket dua kali; tercatat sebagai tindakan sistem. Transaksi sukses sebelum migrasi sumber aktivasi ditampilkan sebagai belum terklasifikasi dalam laporan, tanpa mengubah record aslinya; jangan menganggap angka ini bukti pembayaran. Omzet gateway menggunakan paidAt, bukan waktu pembuatan order.

## Template dan operasional

Menyembunyikan template menghalangi pemilihan/penerapan baru melalui API; desain yang sudah memakai template tidak rusak. Studio memuat ketersediaan server. Preview sandbox tetap tersedia untuk pengujian tanpa membuat undangan.

Operasional menampilkan koneksi/ukuran database, keberadaan konfigurasi R2/gateway, ledger unggahan per backend/state dan aturan kuota. Konfigurasi bukan pemeriksaan konektivitas penyedia. Ledger bukan seluruh bucket R2 maupun kuota gratis provider. Pembersihan tetap memakai rekonsiliasi referensi/antrean job yang sudah ada; panel tidak memiliki hapus bucket massal. Tidak ada pembayaran, pesan WhatsApp, atau penghapusan data pelanggan yang dilakukan dalam QA.

## Validasi

- `npm --prefix backend test`
- `npm --prefix frontend run test:templates`
- `npm --prefix frontend run build`
- `python3 tools/audit/check-built-assets.py`
- Dari direktori backend: `node tests/admin-operations-smoke.mjs` dan `node tests/wedding-workspace-smoke.mjs` (database & server lokal dibutuhkan; akun uji dibersihkan).

Migrasi: `20261029060000_admin_operations`. Audit hanya tersedia untuk tindakan setelah fitur ini diterapkan; tindakan historis tidak direkayasa ulang. Panel monitoring bukan pengganti backup, monitoring provider, atau rekonsiliasi pembayaran bank/gateway.
