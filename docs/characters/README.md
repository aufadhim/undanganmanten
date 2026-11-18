# Paket karakter pasangan Immersia

## Editor

- `frontend/src/components/CharacterPanel.jsx`: karakter bawaan, custom, pengajuan layanan.
- `frontend/src/utils/characterImage.js`: validasi alpha, pemangkasan margin transparan, resize max1200.
- `frontend/src/components/templates/viridarium/adapter.js`: gunakan karakter di scene, penempatan, kamera kepala.
- `frontend/src/components/templates/viridarium/ViridariumTemplate.jsx`: muat ulang renderer saat penempatan berubah.
- Profil potret hanya untuk Signature; data lama tidak dihapus ketika tema berpindah.

Karakter kustom menggunakan ilustrasi pasangan PNG/WebP transparan max5MB.
Foto JPEG/opaque adalah referensi layanan manual, tidak dipasang sebagai cutout langsung.
Satu pose bisa dipakai di sampul dan bagian dalam. Pose terpisah opsional.
Posisi dan skala terpisah per letak, mempertahankan titik bawah karakter pada tanah.
Penanda kepala wanita/pria menyesuaikan target kamera. Komposisi harus ditinjau;
pose ekstrem/karakter yang tertutup objek tidak bisa dijamin otomatis.
Kaki menggunakan batas bawah aset setelah margin transparan dipangkas; gunakan ilustrasi full body.

## Layanan manual

`IllustrationRequest` terpisah dari themeSettings. Foto referensi tidak dimasukkan
ke payload undangan/pratinjau publik. R2 tetap memakai mekanisme penyimpanan media
aplikasi saat ini; endpoint URL aset bukan signed private storage.

Alur: submitted → processing → review → approved. Pemilik dapat minta revisi saat review,
mengembalikan status submitted dengan catatan. Pemilik saja yang menyetujui pemasangan.
Tidak ada pemanggilan AI dan tidak ada charge otomatis. Harga, pembayaran jasa, serta
pengerjaan dikonfirmasi operator terpisah; tidak diwakili sebagai pembayaran paket undangan.

Admin: /admin?tab=illustrations. Hasil transparan wajib, pose dalam undangan opsional.
Status dan unggahan hasil dicatat ke AdminAuditLog. Referensi dan hasil dihitung dalam
ledger storage pemilik undangan dan ikut pembersihan normal setelah tak direferensikan.

Rute pemilik: /api/themes/illustration-request (GET/POST), /approve, /revise (POST).
Rute admin: /api/admin/illustrations (GET), /:id (PATCH), /:id/:side (POST multipart).

Uji: frontend/tests/character-package.test.js, backend/tests/character-package.test.js,
backend/tests/illustration-flow-smoke.mjs (memakai akun/aset sementara lalu dibersihkan).


## Gemini dan kredit generate

Konfigurasi server ada di `backend/.env`:

```dotenv
ILLUSTRATION_PROVIDER=gemini
GEMINI_API_KEY=isi_di_server_saja
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
ILLUSTRATION_GLOBAL_DAILY_LIMIT=10
```

Restart backend setelah mengisi key. Jangan gunakan prefix VITE_ dan jangan menaruh key di frontend.
Konfigurasi model mengikuti dokumentasi resmi: https://ai.google.dev/gemini-api/docs/generate-content/image-generation
`ready` hanya menunjukkan konfigurasi tersedia, bukan verifikasi bahwa key/model punya akses.

Prompt tetap berada di `backend/src/utils/illustrationPolicy.js`. User tidak dapat memasukkan prompt
pakaian/pose baru. Penampilan dan proporsi mengacu foto. Generate full body hanya tersedia setelah
pemilik menyatakan referensi menampilkan kedua tubuh lengkap dan menyetujui pemrosesan Gemini.
Ini konfirmasi pengguna, bukan deteksi anatomi otomatis; hasil tetap harus ditinjau manusia.

Gemini belum menghasilkan alpha transparan. Adaptor memilih latar polos dari warna yang tidak
terdeteksi signifikan pada referensi, kemudian pembersih matte membuat alpha. Ini pembersih
berbasis warna terkontrol, bukan segmentasi AI rambut/tubuh. Jika warna referensi/latar hasil
ambigu, proses ditolak dan kredit dikembalikan. Kualitas tepi tetap perlu ditinjau; jangan gunakan
hasil yang mengubah bentuk tubuh atau menghilangkan pakaian.

Admin mengaktifkan 3 kredit sekali per undangan setelah pembayaran layanan terkonfirmasi.
Kredit tidak reset harian. Maksimal 3 percobaan per akun/hari (WIB), termasuk kegagalan, serta
batas percobaan global di env. Output satu gambar 1K per percobaan; tidak ada retry API otomatis.
Batas global ini batas jumlah panggilan, bukan jaminan nominal tagihan. Atur juga budget penyedia.

Reservasi kredit dan batas menggunakan transaksi DB dengan lock global. requestKey mencegah
klik ganda memakai dua kredit. Kegagalan pasti mengembalikan kredit tepat sekali. Timeout/status
ambigu tidak dikirim ulang otomatis; admin memeriksa lalu mengembalikan kredit melalui antrean.
Job tersimpan di DB dan dipulihkan saat server menyala. Worker dibangunkan oleh enqueue,
bukan polling DB terus-menerus ketika tidak ada pekerjaan.

Hitungan pemakaian mempertahankan ownerId dan timestamp walaupun undangan dihapus; menghapus
undangan tidak mengosongkan batas harian/platform. URL referensi/hasil dibersihkan saat undangan
dihapus. Ledger bukan relasi user dan tidak menyimpan email/foto inline.

Uji tambahan: `backend/tests/illustration-policy.test.js` dan
`backend/tests/illustration-credit-smoke.mjs` (tanpa mengirim permintaan ke Gemini).
Pengujian kualitas hasil nyata memerlukan key aktif serta referensi yang disetujui pemilik.
