# Validasi QA Template Aktif

Tanggal pelaksanaan: 1 September 2026

## Ruang lingkup

Template aktif yang divalidasi:

1. Eternal
2. Seraya
3. Nawasena
4. Isvara
5. Lanqing
6. Celluloid
7. Nocturne

Konteks pengujian utama adalah Mode Coba tanpa login. Pengujian memeriksa registrasi katalog, pemuatan lazy component, pembukaan cover, keberadaan section, konten kosong/dummy, overflow horizontal, error runtime, dan empat mode preview: Mobile, iPad, iPad Pro, dan Desktop.

## Hasil

| Pemeriksaan | Hasil |
|---|---|
| Katalog hanya menampilkan tujuh template | Lulus |
| Seluruh root template dapat dirender | Lulus |
| Cover seluruh template dapat dibuka | Lulus |
| Section yang dirender memiliki dimensi terlihat | Lulus |
| Tidak ada overflow horizontal pada root template | Lulus |
| Tidak ada overflow horizontal pada empat mode preview | Lulus |
| Tidak ada `pageerror` JavaScript selama smoke test | Lulus |
| Tidak ada gambar gagal dengan URL non-kosong pada pemeriksaan DOM | Lulus |
| Template development tidak dapat dipaksa lewat parameter URL sandbox | Lulus; fallback ke Eternal |
| Template development dari data backend dinormalisasi di dashboard | Lulus; fallback ke Eternal |
| Contract test template | 14/14 lulus |
| Playwright smoke QA | 9/9 lulus |

## Temuan dan tindakan

### 1. Mode Coba masih menerima seluruh ID Atelier

**Status:** Diperbaiki.

`SandboxDashboard` sebelumnya menggunakan `ATELIER_THEME_IDS`, sehingga template yang disembunyikan dari katalog masih dapat dibuka lewat `?theme=daguerre` dan ID development lain. Daftar dukungan sekarang eksplisit hanya berisi tujuh template aktif. URL template development jatuh aman ke Eternal.

Dashboard terautentikasi juga menormalisasi `themeId` lama dari backend. Undangan lama yang masih menyimpan ID development dirender menggunakan Eternal dan tidak diteruskan ke editor sebagai template aktif.

### 2. Celluloid masih membawa cabang Daguerre dan fallback generik

**Status:** Diperbaiki.

Cabang runtime, aset, copywriting, scene, dan conditional rendering yang bukan milik Celluloid telah dihapus dari `CelluloidTemplate.jsx`. Konfigurasi Celluloid sekarang eksplisit dan mandiri.

### 3. Stylesheet Celluloid membawa selector seluruh koleksi Atelier

**Status:** Diperbaiki.

Selector milik 24 template development telah dikeluarkan dari stylesheet Celluloid. Ukuran sumber CSS turun dari sekitar 316 KB menjadi sekitar 174 KB. Contract test baru mencegah selector template development masuk kembali.

### 4. QA otomatis sebelumnya hanya memeriksa kontrak source

**Status:** Diperbaiki sebagian.

Ditambahkan suite Playwright mandiri `templates-active.spec.js` dan konfigurasi `playwright.templates.config.ts`. Suite ini dapat dijalankan tanpa database backend:

```bash
cd frontend
npx playwright test --config=playwright.templates.config.ts
```

## Batas validasi

Validasi ini belum menyatakan seluruh alur bisnis production bebas regresi. Yang belum tercakup:

- Penyimpanan perubahan dashboard ke database dan reload.
- Halaman publik dengan undangan production-like untuk setiap template.
- RSVP dan ucapan yang benar-benar menulis ke backend untuk setiap template.
- Overlay hadiah, livestream, video, dan lightbox melalui seluruh interaksi keyboard/touch.
- Matriks galeri visual 0, 1, 2, 3, 4, 5, 8, 15, dan 20 foto.
- Visual snapshot/pixel comparison sebagai baseline desain.
- Browser selain Chromium.

Pengujian tersebut memerlukan database test terpisah melalui `TEST_DATABASE_URL` dan sebaiknya menjadi tahap QA integrasi berikutnya.

## Kesimpulan

Tujuh template aktif lolos smoke QA terstruktur pada Mode Coba dan empat mode preview. Tidak ditemukan blocker rendering, overflow horizontal, atau error runtime dalam cakupan ini. Status yang tepat adalah **aktif dan lolos smoke QA**, dengan QA integrasi backend dan visual-regression penuh sebagai lapisan berikutnya.
