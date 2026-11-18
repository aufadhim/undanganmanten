# Membuat template baru dari awal sampai integrasi

1. Tentukan engine dan brief: suasana/budaya spesifik, palet, nama satu kata, landmark utama, karakter, perjalanan kamera. Jangan mencampur ornamen daerah asal tanpa alasan.
2. Pilih tema acuan dari engine yang sama. Duplikasi **pack tema**, bukan shared engine. Untuk engine 3 baca `docs/ENGINE_3_RIVIERA.md` dan art prompts.
3. Rancang art pack: background panorama/area yang berkesinambungan, foreground alpha, landmark, ornamen ambience, pasangan cover/hero, thumbnail, frame. Buat manifest daftar aset+dimensi+fungsi/depth+prompt. Jaga karakter cat air senada.
4. Siapkan aset terkompresi. Pertahankan aspect ratio; jangan stretching. Foto personal harus diizinkan pemiliknya. AI tool tiap harness berbeda: bila tidak ada generator, tandai kebutuhan aset secara jujur.
5. Susun koordinat world/room, depth, anchor kaki, skala pasangan, framing HP, text safe areas. Untuk engine 3 pakai world origin dan clamp yang benar, bukan mengakali transform CSS per viewport. Periksa semua stops dan jalur di antaranya.
6. Isi config publik dan React defaultConfig secara konsisten. Pertahankan binding HTML/copy. Setting publik harus berubah melalui adapter, bukan hardcode nama/tanggal di art.
7. Terapkan motif warna/wash tema. Reuse seluruh fitur shared. Jangan mengembalikan fitur/control yang telah dihapus dalam DESIGN_CONTRACT.
8. Buat wrapper tema, daftarkan katalog/capabilities/frontend/backend sesuai ENGINE_MAP. Pastikan bisa dipilih di dashboard dan sandbox, bukan hanya halaman lab. Tambah thumbnail/frame dan fallback karakter.
9. Tes unit relevan dan build. Tambah regression yang menguji perilaku/invarian, bukan menyalin implementation. Verifikasi public asset paths dan 404. Tidak perlu memanggil API berbayar untuk unit test.
10. QA visual minimal: 390x844 HP dan desktop; cover intro/idle/open; hero; quote; dua profil; countdown/acara/rundown; story; setiap layout galeri+video/lightbox; dresscode/live/frame/gift; RSVP/wishes; penutup/return. Scroll bolak-balik, dots lompat jauh, reduced motion, tab hidden, Canvas fallback. Jangan menyatakan lulus tanpa melihat.
11. QA CMS di aplikasi asli: ganti tema, ubah nama/tanggal, upload+posisi cover/hero/closing, typography per bagian/reset, reorder/hide section. Simpan lalu reload memastikan preview tidak revert ke respons lama. Uji data demo tanpa menghapus milik pelanggan.
12. Dokumentasikan nama+ID+engine, paths edit utama, art prompts, ukuran aset, known limitations, hasil tes, dan screenshot nonpersonal bila akan dibagikan.

## Syarat selesai
- Tidak merusak engine/tema lain.
- Tidak ada ilustrasi stretch atau skala kurcaci/props raksasa.
- Readability terjaga di semua bagian.
- Tema terdaftar frontend+backend, data dinamis benar.
- Interaksi shared, tidak diduplikasi hanya untuk demo.
- Tidak membawa kredensial/potret pelanggan ke paket publik.
