# Wedding Planner Samavaya

Planner tersedia di `/planner`, terpisah dari editor undangan. Seluruh data disimpan per pernikahan. Membuka planner tidak mengubah konten undangan publik.

## Akses dan berbagi

- Pemilik dapat mengundang pasangan melalui email. Tautan penerimaan berlaku tujuh hari dan harus diterima dari akun dengan email penerima yang sudah diverifikasi.
- Anggota dapat memperbarui tugas, anggaran, tabungan, administrasi, seragam, vendor, seserahan, serta rundown. Akses ini tidak memberikan hak mengubah paket, pembayaran paket, daftar tamu, atau editor undangan.
- Pemilik dapat mencabut akses anggota melalui tab Akses pasangan.
- Di Hari H, pemilik dapat membuat tautan baca dengan masa berlaku 30 hari. Tautan hanya menampilkan identitas pernikahan dan jadwal beserta lokasi, PIC, dan catatan. Data keuangan dan dokumen tidak ikut dibagikan.
- Tautan baca dapat dicabut di Akses pasangan. URL rahasia disimpan sebagai hash dan disamarkan di log aplikasi.
- Setelah masuk atau selesai mendaftar dari undangan planner, pengguna kembali ke halaman penerimaan undangan.

## Keuangan

- Target total dan batas kategori berada di Anggaran. Nama kategori pada pos biaya/vendor harus sesuai dengan nama batas kategori; pencocokan mengabaikan kapitalisasi dan spasi tepi.
- Vendor yang ditandai masuk anggaran ikut dalam total. Hindari mencatat tagihan vendor yang sama lagi sebagai pos biaya terpisah.
- Setiap pos biaya dan vendor mempunyai riwayat cicilan. Saldo pembayaran lama dipertahankan sebagai saldo awal saat cicilan pertama ditambahkan.
- Setelah memakai riwayat cicilan, total sudah dibayar dihitung dari riwayat tersebut. Perubahan rincian vendor tidak menimpa riwayat. Cicilan dapat dihapus untuk koreksi.
- Tabungan mencatat setoran, penyetor, tanggal, target, dan progres. Ini pencatatan dana, bukan layanan rekening atau transfer uang.

## Modul lain

Administrasi menyimpan dokumen, instansi, penanggung jawab, tenggat, status, dan tautan. Seragam menyimpan penerima, kelompok, ukuran, bahan, penjahit, jumlah, tenggat, dan status distribusi. Vendor dan seserahan mempunyai detail paket, tautan penawaran/toko, dan status pemesanan. Data yang baru diperbarui menampilkan email editor terakhir dan waktunya.

Rundown dapat diunduh sebagai Excel untuk diedit atau PDF beridentitas Samavaya untuk dibagikan. PDF memuat nama pasangan, tanggal, kegiatan, lokasi, PIC, dan catatan serta mendukung banyak halaman.

## Pemeriksaan

`node --test frontend/tests/planner-invite-context.test.js` memeriksa tujuan kembali setelah login.

Dari folder backend, `node tests/planner-collaboration.integration.mjs` menguji API dan otorisasi dengan akun sementara; pengiriman email ditahan oleh pengganti layanan email dalam proses pengujian. `node tests/planner-ui.integration.mjs` memeriksa UI pada layanan lokal port 4080, penyimpanan, PDF, dan penerimaan anggota. Keduanya memerlukan database pengujian yang dikonfigurasi; akun sementara dibersihkan di akhir pengujian. Jangan menjalankan serentak dengan perubahan skema.
