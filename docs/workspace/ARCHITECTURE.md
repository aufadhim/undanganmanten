# Dashboard pernikahan dan studio undangan

## Ruang kerja

- `/dashboard`: ringkasan pengelolaan pernikahan.
- `?section=invitations`: daftar desain/undangan, arsip, hapus permanen, publikasi.
- `?section=guests&invitation=<id>`: tabel tamu di halaman lebar, RSVP, impor, WhatsApp, check-in dan ucapan. Pengaturan RSVP serta template pesan dilipat agar tabel menjadi fokus.
- `?section=analytics&invitation=<id>`: analitik lebar. Views per desain; tamu/RSVP milik pernikahan.
- `?section=billing&invitation=<id>`: paket, aktivasi dan transaksi, tanpa membuka studio.
- `?section=settings&invitation=<id>`: tautan dan pengelolaan desain.
- `?invitation=<id>&view=studio`: hanya Desain dan Konten, dengan preview HP. URL editor lama tanpa section tetap didukung.
- Panduan menjadi halaman bantuan terpisah, tidak ditempel ke navigasi studio.

Dashboard.jsx mengatur pemuatan data serta perpindahan ruang. WeddingWorkspace menjadi shell operasional; InvitationLibrary mengelola desain, arsip, dan publikasi. Panel operasional dipasang dengan key undangan agar data tidak tertukar saat berpindah konteks. TamuTableModal mendukung embedded table; preview tidak lagi otomatis membuka studio saat daftar tamu dimuat.

## Domain data

`User → Wedding → Invitation` dan `Wedding → Guest → RsvpResponse`.

- Migrasi `20261029030000_wedding_workspace` menambah Wedding dan wedding_id. Setiap undangan lama mendapat wadah terpisah; tidak ada penggabungan berdasarkan kesamaan nama.
- ID tamu dan RSVP tidak diubah. `Guest.invitationId` menjadi penanda asal opsional, bukan pemilik utama. Query operasional serta tautan publik memakai wedding_id dengan fallback untuk fixture/record legacy.
- Desain baru dapat menggunakan pernikahan yang sudah ada. Duplikasi menggunakan wedding_id sumber; tidak menggandakan tamu/RSVP.
- Tautan pribadi untuk desain yang masih ada menerima ID tamu yang sama di semua desain satu pernikahan. Menghapus desain menghentikan tautan desain itu, tetapi tidak menghapus master tamu/RSVP.
- Bila desain terakhir dihapus, direktori tamu tetap dapat dilihat, ditambah dan dihapus di dashboard melalui `/api/weddings/:id/guests`. Metadata pernikahan kosong tanpa desain/tamu dibersihkan saat penghapusan desain.
- Endpoint Wedding selalu memeriksa owner. Undangan tidak dapat dikaitkan ke pernikahan milik akun lain.
- Konten, tema, order, views dan ucapan tetap milik desain. Budget/keuangan/vendor/souvenir kelak menggunakan wedding_id dan tidak bergantung pada desain undangan.

## Batas bisnis

Kuota 3 undangan total per akun termasuk arsip dan paket berbayar tetap berlaku. Kuota media 50 MiB/desain dan 150 MiB/akun tidak berubah. Wadah pernikahan dibatasi 3 per akun; proyek lama di atas batas tidak dihapus. Tamu menggunakan kapasitas tertinggi di antara paket desain dalam pernikahan; kuota media/galeri tetap mengikuti desain.

Registry `frontend/src/config/weddingModules.js` menyimpan modul budget, finance, vendors, souvenirs sebagai disabled. Tidak ada menu atau fitur perencanaan yang ditampilkan sebelum implementasinya siap.

## Verifikasi

`npm --prefix backend test`, `npm --prefix frontend run test:templates`, `npm --prefix frontend run build`.

`node tests/wedding-workspace-smoke.mjs` dari backend menjalankan uji pada akun disposable: shared guests, bulk import, foreign owner rejection, personal links across two published designs, shared RSVP/check-in, deletion preserving master guests, and directory without an active invitation. Tidak melakukan pembayaran atau mengubah data pengguna yang ada.
