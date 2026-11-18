# Watercolor Stage 1 — cover dan penutup

Terpasang pada Sekar Jawa / Mental Canvas 1. Asset `stageArch` dan `stageFlowers` mengaktifkan modul panggung secara opt-in; Anam Garden dan Mental Canvas 2 tetap memakai pembukanya sendiri.

## Pengalaman

Pembukaan 5,6 detik bergerak dari pandangan luas, bergeser melintasi gerbang dan bunga yang lebih dekat, kemudian berhenti pada pasangan. Tombol Open Invitation dapat diklik selama intro. Kamera melanjutkan dari posisi aktual saat tombol diklik, dengan peralihan 3 detik menuju hero. Jarak kamera akhir tetap di depan bidang foreground terdekat; tidak memakai skala horizontal/vertikal berbeda.

Penutup menggunakan panggung yang sama, dengan pasangan lebih rendah dan teks HTML pada bagian atas. Navigasi mundur masuk ke isi kembali. Kembali ke sampul menginterpolasi posisi pasangan dan kamera; sampul kembali pada komposisi diam, bukan memulai ulang intro mendadak. Kontrol ulangi dapat menjalankan intro lagi.

Tujuh lapisan: candi jauh, kabut belakang, pasangan, gerbang, kanopi, kabut depan, bunga dekat. Kabut dibuat dari radial pigment gradients; partikel ringan digambar lewat kode. Panggung WebGL memakai renderer bersama dan batas resolusi yang sama. Saat pembukaan/peralihan selesai, renderer idle dibatasi 30 fps; perjalanan aktif mengikuti requestAnimationFrame. Tab tersembunyi tidak menggambar, waktu simulasi dibatasi agar tidak melompat besar. Reduced motion melewati perjalanan panjang dan memakai transisi 220 ms tanpa partikel.

## File pengaturan

- `frontend/public/templates/cover-stage/stage-pack.js`: susunan kedalaman, jalur intro, pose diam dan penutup.
- `frontend/public/templates/cover-stage/stage.js`: state, handoff, intro/idle, partikel, penutup dan kembali.
- `frontend/public/templates/cover-stage/stage.css`: posisi teks dan sambungan lapisan UI.
- `frontend/src/components/templates/sekar-jawa/defaultConfig.json`: sumber konfigurasi induk.
- `frontend/public/templates/sekar-jawa/config/invitation.json`: baseline runtime (tetap sinkron dengan induk).
- `frontend/public/templates/sekar-jawa/assets/stage-arch-v1.webp` dan `stage-flowers-v1.webp`: dua asset baru, total sekitar 596 KiB, maksimal 960×1440.
- `stageLandscape` memakai ulang gambar Prambanan dari Pramaya; pasangan dan kanopi memakai asset Sekar Jawa dusty v3.
- `docs/sekar-jawa/stage-prompts.json`: prompt built-in image_gen serta sumber gambar asli.

## Integrasi dan validasi

Bootstrap memuat stage hanya jika kedua key asset tersedia. Cover scene memakai factory panggung; navigator tetap mempertahankan fitur, scroll, menu, RSVP, dan audio. Struktur text-node template tidak diubah. Label tombol tetap tanpa panah.

26 tes template lolos, termasuk uji struktur tujuh lapisan, resource, isolasi Anam Garden, validasi konfigurasi, interpolasi dan batas kamera pembukaan. Build dan pemeriksaan URL asset selesai. Pratinjau diuji pada cover, replay intro, open, penutup, navigasi mundur dan return. Pengukuran awal di browser pengujian menunjukkan p95 sekitar 18,6 ms per frame selama perjalanan penutup; hasil perangkat lain dapat berbeda.


## Revisi v2 — jalan taman yang menapak

Gapura simetris diganti satu pilar kecil di kiri. Layer kanopi pembingkai dilepas; rumpun bunga diperkecil dan diletakkan di tepi kanan. Dua asset pengganti dibuat dengan built-in image_gen: `stage-pillar-v2.webp` (alpha kosong dipangkas saat optimasi) dan `stage-ground-v2.webp`. Prompt: `grounded-stage-prompts.json`. Key `stageArch` dipertahankan untuk kompatibilitas konfigurasi, tetapi isinya sekarang pilar tunggal; `stageGround` menambah tekstur pelataran.

Renderer bersama mendukung bidang `ground:true`: koordinat sudut berada pada sumbu X–Z dengan Y konstan, bukan billboard vertikal. Pilar dan tanaman memakai anchor bawah; Y lantai, kaki pilar, tanaman dan bayangan kontak mengikuti posisi telapak pasangan, termasuk saat penutup dan return. Dua bayangan kontak radial dihasilkan lewat kode. Dua asset pengganti berjumlah sekitar 530 KiB. Panggung sekarang mempunyai sembilan lapisan, tanpa gapura kanan atau batas atas dekoratif. Kamera dan handoff tetap dipertahankan.

Validasi: 26 tes template, build, pengecekan asset, dan browser cover/replay/open/penutup. Perubahan renderer hanya aktif pada layer yang memakai `ground` atau `anchor`, sehingga lapisan template lama tetap memakai proyeksi sebelumnya.
