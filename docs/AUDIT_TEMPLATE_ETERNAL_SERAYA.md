# Audit Template Eternal dan Seraya

Dokumen ini merangkum evaluasi produk dan UI yang telah dilakukan selama pengembangan Eternal dan Seraya. Dokumen ini adalah sumber tindak lanjut; label status tidak boleh diartikan sebagai lolos QA tanpa pengujian ulang di dashboard, Mode Coba, dan halaman publik.

## Arti status

- **Selesai — perlu regresi:** pernah diterapkan dan harus dipastikan tidak rusak oleh perubahan berikutnya.
- **Sebagian:** implementasi ada, tetapi masih ada bagian yang belum konsisten atau belum terverifikasi.
- **Belum selesai:** kebutuhan sudah disepakati, tetapi hasil belum memenuhi.
- **Keputusan produk:** aturan bisnis/desain yang harus dipertahankan.

## Keputusan lintas template

### Arsitektur dan desain

- **Keputusan produk:** setiap template harus mempunyai desain khas untuk RSVP, hadiah, ucapan, galeri, video, countdown, acara, dresscode, rundown, livestream, dan bagian lain. Komponen bersama hanya menangani perilaku generik seperti aksesibilitas, lightbox, pemutar, kalender, dan koneksi data; tampilannya harus dapat diubah oleh template.
- **Selesai — perlu regresi:** struktur dasar template telah dipisahkan ke folder masing-masing dan kontrak struktur dicatat di `frontend/src/components/templates/README.md`.
- **Selesai — perlu regresi:** tersedia perintah checklist template `npm run test:templates`. Setiap template baru wajib lolos tes tersebut dan `npm run build`.
- **Keputusan produk:** urutan mempelai di semua template adalah pengantin wanita dahulu, lalu pengantin pria.
- **Keputusan produk:** data kosong di editor/Mode Coba tetap harus menghasilkan preview lengkap memakai dummy. Data dummy tidak boleh menimpa data nyata atau halaman publik yang memang sengaja kosong.
- **Keputusan produk:** semua perubahan sidepanel harus terlihat realtime di preview, tetapi perubahan tetap perlu disimpan secara eksplisit. Jika ada draft belum disimpan ketika berpindah tab, tampilkan peringatan; setelah simpan berhasil, peringatan tidak boleh muncul.
- **Sebagian:** mekanisme preview realtime dan peringatan draft sudah diperbaiki pada sejumlah panel, tetapi semua panel dan template masih perlu matriks pengujian regresi.

### Data dummy baku

- Nama default: **Deva Nararya** dan **Arunika Candramawarni**.
- Nama orang tua boleh berupa nama dummy yang pantas dan konsisten.
- Foto dummy pria menggunakan gambar yang diberikan pengguna; foto dummy wanita menggunakan aset yang telah disepakati.
- Galeri dummy berisi delapan foto dan video dummy yang telah disediakan.
- Semua section aktif dalam preview harus mempunyai konten dummy yang masuk akal: quote/doa, profil, acara, countdown, galeri, video, rundown, Our Story, dresscode, livestream, filter Instagram, RSVP, hadiah, ucapan, dan penutup.
- **Selesai — perlu regresi:** helper dummy preview bersama sudah tersedia.

### Susunan editor konten

Urutan panel konten yang disepakati:

1. Profil
2. Quote / Doa
3. Mempelai
4. Informasi Acara
5. Save the Date
6. Galeri Foto & Video
7. Rundown
8. Cerita Cinta
9. Dresscode
10. Live Streaming
11. Filter Instagram
12. RSVP
13. Informasi Hadiah
14. Ucapan & Doa
15. Penutup

- Susunan Blok harus mengikuti urutan editor tersebut agar pengguna tidak bolak-balik jauh.
- Kontrol yang hanya mengulangi Susunan Blok harus dihapus dari panel individual, misalnya checkbox tambahan untuk menampilkan ucapan atau hadiah.
- QR tetap fitur premium/add-on dan harus mempunyai kontrol yang mudah ditemukan. Live streaming dan filter Instagram tidak boleh terkunci hanya karena akun bukan premium, sesuai keputusan terakhir untuk filter Instagram.

### Galeri dan video

- Layout harus mempunyai preview visual pada picker, bukan hanya nama.
- Layout yang tersedia mencakup grid rapi, editorial, collage, wallboard/tempel dinding, dan slider. Setiap template boleh menafsirkan gaya visualnya sendiri, tetapi perbedaan antarlayout harus terlihat jelas.
- Semua layout harus aman untuk jumlah foto ganjil, genap, sedikit, serta 15–20 foto: tidak boleh menyisakan lubang kosong yang janggal, memotong konten, atau membuat ukuran kartu tak terkendali.
- Lightbox harus berada di dalam viewport undangan/phone preview pada semua mode perangkat, tidak mengambil alih seluruh dashboard, tidak terpotong, dapat discroll bila perlu, dan dapat ditutup.
- Lightbox perlu mendukung navigasi seluruh media yang relevan. Video tidak boleh keliru dihitung sebagai foto, tetapi harus dapat dibuka/ditonton melalui pengalaman media yang konsisten.
- Pemutar video mempunyai tombol play di tengah. Setelah mulai, tombol pause memudar perlahan dan muncul kembali saat hover/fokus. Warna hover mengikuti palet template.
- Lebar player mengikuti container galeri: cukup lebar, tetapi tetap mempunyai ruang kanan-kiri dan tidak menempel ke frame perangkat.
- **Sebagian:** perilaku dasar lightbox/player dan dummy media sudah dibuat; setiap layout dan jumlah foto masih wajib diuji per template.

### Save the Date

- Komponen terdiri dari judul, countdown, kalender bulan acara dengan tanggal pernikahan ditandai, dan tombol Add to Calendar.
- Teks tanggal besar yang mengulang informasi kalender harus dihilangkan agar tidak redundant.
- Font, bentuk tombol, warna, dan penanda tanggal mengikuti identitas template.
- Penanda tanggal tidak boleh berupa lingkaran generik; gunakan bentuk artistik seperti sapuan brush sesuai tema.
- Countdown hari, jam, menit, dan detik harus berjalan realtime.
- **Sebagian:** komponen bersama sudah tersedia, tetapi styling spesifik dan penanda tanggal perlu verifikasi pada setiap template.

### Hadiah

- Hadiah bersifat opsional dan tidak meminta tamu mengonfirmasi transfer.
- Tidak diperlukan nama pengirim, nominal, unggah bukti, atau rekap transfer.
- Pemilik undangan dapat menambahkan beberapa rekening.
- Mode pilihan: hanya transfer, hanya kirim bingkisan, atau keduanya. Preview harus mengikuti pilihan tersebut.
- Detail rekening/alamat disembunyikan lebih dulu. Tamu menekan tombol untuk membuka informasi dalam popup.
- Popup harus berada di dalam viewport undangan pada mobile, tablet, dan desktop preview; tidak overflow horizontal, tidak terpotong, dapat discroll, dan tombol tutup selalu dapat digunakan.
- UI popup mengikuti font, warna, border, shadow, dan karakter desain masing-masing template.
- **Selesai — perlu regresi:** portal popup telah diarahkan ke wrapper phone preview.
- **Sebagian:** input rekening/radio mode dan seluruh kombinasi preview perlu diuji ulang end-to-end.

### Live streaming dan Filter Instagram

- Live streaming berupa satu card bergambar yang dapat diunggah pengguna, dengan tombol play di tengah.
- Tombol membuka video YouTube dalam lightbox di dalam undangan, bukan tab baru.
- Filter Instagram berupa card bergambar contoh filter yang dapat diunggah pengguna dan tombol menuju Instagram; bukan pemutar video.
- Filter Instagram adalah konten dan editor-nya berada di tab Konten.
- Font, warna, dan komposisi kedua card mengikuti template.
- **Sebagian:** card dan editor sudah dibuat; koneksi realtime, upload gambar, dan semua template perlu dites ulang.

### RSVP dan ucapan

- RSVP maksimal dua orang.
- RSVP dan ucapan harus tersimpan ke backend undangan yang benar, memperbarui status/daftar tamu, dan tidak menghasilkan “undangan tidak ditemukan”.
- Form RSVP hanya untuk penerima undangan. Opsi “izinkan RSVP tanpa link pribadi” perlu dijelaskan atau disederhanakan agar tidak membingungkan.
- Batas waktu RSVP tetap diperlukan.
- Ucapan langsung tampil tanpa moderasi manual, tetapi kata terlarang ditolak otomatis dengan pesan yang sopan.
- UI daftar ucapan mempunyai card walaupun data belum ada; preview editor boleh memakai dummy.
- Panel pengelolaan ucapan harus rapat dan rapi, tanpa ruang kosong berlebihan.
- **Sebagian:** alur pernah diperbaiki pada Eternal; wajib dites ulang untuk undangan baru, undangan yang dihapus/dibuat ulang, dan semua template.

### Typography, warna, dan animasi

- Pilihan font perlu beragam dan editor menyediakan line spacing serta letter spacing.
- Seluruh palet warna harus realtime tanpa menunggu tombol simpan panel lain.
- Animasi visual salju/daun harus lambat, mulus, beragam ukuran/opacity/blur, dan jatuh sampai keluar viewport sebelum didaur ulang. Confetti dihapus.
- Animasi pembuka sampul dapat dipilih pengguna, mempunyai preview, tersimpan, dan benar-benar diterapkan pada template.
- Gerakan wedding harus lambat, lembut, elegan, dan menghormati `prefers-reduced-motion`.
- Jangan memasang opacity 0 secara dinamis ke semua `div`, `p`, dan heading. Elemen harus terlihat secara default; animasi adalah progressive enhancement dan tidak boleh menyebabkan halaman kosong jika observer gagal.

## Audit Eternal

### Identitas visual dan default

- Eternal adalah template clean/light. Undangan baru tidak boleh tiba-tiba memakai background hitam/dark akibat default tema lama, data kosong, atau kebocoran preset.
- **Belum tuntas:** regresi Eternal beberapa kali kembali menjadi dark setelah undangan dihapus/dibuat ulang atau setelah perubahan tema lain. Perlu tes preset baru, migrasi data lama, fallback warna, Mode Coba, dashboard, dan publik.

### Kelengkapan section

- Eternal dijadikan baseline kelengkapan bisnis: cover, quote/doa, mempelai, acara, Save the Date, galeri, video, rundown, Our Story, dresscode, livestream, filter Instagram, RSVP, hadiah, ucapan, penutup.
- Bio profil bersifat opsional, mempunyai dummy, serta toggle on/off yang berbentuk sama dengan toggle Susunan Blok.
- Our Story mempunyai dummy dan tidak lagi meminta tag HTML `<b>`/`<i>`; label serta placeholder harus sesuai editor rich text yang sebenarnya.
- Lokasi ringkas pada cover/footer mengambil kata lokasi terakhir dari alamat acara, misalnya alamat berakhir “Jakarta” maka yang tampil “Jakarta”.
- Background section livestream dan filter Instagram harus menyatu dengan section Eternal lainnya.
- Jarak judul ke section sebelumnya, RSVP ke ucapan, serta hadiah ke ucapan tidak boleh terlalu jauh. Area ucapan tetap mempunyai card/list ketika belum ada data.
- Judul RSVP dan Ucapan & Doa mempunyai subtitle yang sesuai.
- **Sebagian:** sebagian besar section dan dummy telah diterapkan, tetapi keseluruhan perlu audit visual ulang setelah perubahan komponen bersama.

### Galeri Eternal

- Editorial, collage, dan wallboard harus benar-benar berbeda.
- Collage dan wallboard sebelumnya dinilai aneh; layout harus memenuhi lebar container tanpa hanya memakai sepertiga layar, tetapi tetap menjaga padding.
- Semua variasi jumlah foto harus mengikuti aturan lintas template tanpa gap kosong.
- Lightbox sebelumnya blank/terpotong; harus dites kembali pada phone preview dan halaman publik.
- **Sebagian:** beberapa perbaikan layout telah dilakukan, belum dianggap final tanpa matriks 1, 2, 3, 4, 5, 8, 15, dan 20 foto.

### Eternal: status fitur penting

- RSVP maksimal dua orang.
- RSVP/ucapan harus masuk tab Tamu dan status RSVP terbarui.
- Hadiah mendukung beberapa rekening dan tiga mode informasi.
- Video dummy, delapan foto dummy, foto mempelai, dan Our Story dummy harus selalu tampil di preview kosong.
- Animasi Eternal sudah menjadi referensi tempo “lambat dan fancy”, tetapi pemeriksaan bahwa setiap section/elemen penting mendapat gerak yang proporsional tetap diperlukan. Tidak semua `div` perlu dianimasikan jika merusak komposisi atau performa.

## Audit Seraya

### Arah desain

- Seraya adalah tema editorial/wedding newspaper, terinspirasi referensi tetapi tidak boleh terlihat menjiplak.
- Cover harus estetik dan orisinal: foto, hierarki editorial, nama pasangan, metadata/tanggal, dan aksen khas Seraya.
- Cover harus pas satu viewport undangan; tanggal dan metadata tidak boleh tenggelam sehingga pengguna harus scroll sedikit hanya untuk melihat bagian bawah cover.
- Quote/doa setelah cover harus berasal dari katalog pilihan. Jika pengguna mengganti preset, preview harus berubah realtime dan section tidak boleh hilang.

### Realtime dan data dummy

- Quote, rundown, Our Story, dresscode, Susunan Blok, livestream, filter Instagram, dan hadiah harus berubah realtime.
- Video dummy Seraya harus tampil ketika belum ada video pengguna.
- Love Story/Our Story dummy harus tampil ketika database kosong.
- Semua section lain juga mengikuti aturan dummy lintas template.
- **Sebagian:** rundown realtime dan dummy story/media pernah diperbaiki; perlu regresi ulang dalam satu undangan baru yang benar-benar kosong.

### Galeri Seraya

- Editorial dan collage tidak boleh tampak sama.
- Editorial memakai hierarki seperti halaman majalah/koran.
- Collage memakai komposisi tumpang tindih/berlapis atau susunan bebas yang terkendali, tanpa ruang kosong di samping foto besar.
- Layout harus tetap rapi pada phone preview serta jumlah foto ganjil, genap, dan banyak.
- **Sebagian:** layout telah dibedakan dan gap pernah diperbaiki, tetapi perlu matriks pengujian jumlah foto.

### Our Story Seraya

- Arah desain disepakati sebagai bacaan koran: masthead/label edisi, headline, lead paragraph, kolom atau pembagian editorial yang nyaman, dan timeline yang masih terbaca.
- Timeline cukup memakai bulan/tahun, tidak perlu tanggal detail bila tidak relevan.
- Titik timeline harus terhubung garis demi garis dan perubahan item terlihat realtime sebelum simpan.
- Dummy story yang sekarang dinilai baik dan harus dipertahankan.
- **Sebagian:** layout koran dan dummy telah dibuat; realtime keseluruhan masih perlu diuji.

### Save the Date Seraya

- Menggunakan konsep countdown + kalender, tetapi semua tipografi dan tombol harus terasa Seraya, bukan gaya bawaan komponen.
- Tanggal acara ditandai sapuan brush/mark editorial, bukan bulatan dasar.
- Hilangkan tanggal teks yang redundant tepat sebelum kalender.
- **Sebagian:** perlu inspeksi visual ulang terhadap font tombol dan bentuk penanda.

### Hadiah Seraya

- Popup rekening/alamat memakai bahasa desain editorial Seraya.
- Modal harus tetap berada dalam phone preview pada semua device preview.
- Regresi yang pernah terjadi: overflow-x, bagian atas/bawah terpotong, scroll terkunci, tombol tutup tidak dapat dijangkau, lalu modal sempat keluar memenuhi dashboard. Semua kondisi ini wajib menjadi kasus tes.
- **Selesai — perlu regresi:** target portal telah diperbaiki ke wrapper preview.

### Animasi Seraya

- **Belum selesai.** Animasi saat ini belum berjalan karena implementasi terakhir sengaja di-rollback setelah menyebabkan seluruh konten Seraya kosong.
- Kebutuhan: animasi lambat dan elegan seperti Eternal pada cover pembuka, section, heading, paragraf, gambar, card, dan ornamen yang relevan.
- Implementasi berikutnya harus opt-in per komponen/kelas semantik, bukan memindai dan menyembunyikan setiap node DOM.
- Elemen selalu terlihat secara default. Kelas animasi hanya menambahkan transform/transisi ketika JavaScript siap.
- Observer harus menggunakan root scroll preview yang benar, mempunyai fallback instan, cleanup, dukungan konten dinamis, dan `prefers-reduced-motion`.
- Animasi tidak boleh mengganggu form, modal, lightbox, media player, sticky/floating audio, scroll, fokus keyboard, atau performa.
- Wajib dites pada dashboard phone preview, Mode Coba, halaman publik, serta ukuran mobile/iPad/iPad Pro/desktop sebelum dianggap selesai.

## Regresi yang wajib dicegah

1. Template kosong karena elemen mendapatkan `opacity: 0` tetapi tidak pernah direveal.
2. Eternal berubah dark akibat fallback/preset yang salah.
3. Modal/lightbox keluar dari undangan dan mengambil alih dashboard.
4. Modal tidak dapat discroll atau ditutup.
5. Sidepanel realtime, tetapi data tidak tersimpan dan peringatan draft salah status.
6. Section hilang ketika nilai sidepanel diubah sebelum disimpan.
7. Dummy menimpa data nyata atau dummy tidak muncul pada preview kosong.
8. Layout galeri menyisakan hole pada jumlah ganjil atau rusak pada 15–20 foto.
9. Video dummy hilang atau player menempel ke frame perangkat.
10. Preset tema tidak ditemukan oleh backend atau tidak konsisten dengan katalog frontend.

## Matriks QA minimum per template

- Konteks: dashboard editor, Mode Coba tanpa login, halaman publik dengan link tamu, halaman publik tanpa link tamu.
- Viewport: mobile, tablet, iPad Pro, desktop.
- Data: database kosong, data dummy preview, data pengguna lengkap, satu field hilang, undangan dihapus lalu dibuat ulang.
- Galeri: 0, 1, 2, 3, 4, 5, 8, 15, 20 foto; dengan dan tanpa video.
- Fitur: setiap Susunan Blok on/off, perubahan realtime, simpan, pindah tab, reload, dan buka publik.
- Form: RSVP 1/2 orang, ucapan aman/terlarang, hadiah tiap mode, beberapa rekening.
- Overlay: galeri, video, livestream, rekening, alamat; buka, scroll, navigasi, escape/backdrop/tombol tutup.
- Gerak: pembuka, scroll turun/naik, konten dinamis, reduced motion, perangkat lambat.
- Hasil akhir: `npm run test:templates` dan `npm run build` harus lolos.

## Urutan pekerjaan berikutnya

1. Pulihkan dan pertahankan stabilitas visual Seraya (sudah dipulihkan dari halaman kosong).
2. Bangun ulang animasi Seraya secara opt-in dan uji semua viewport/konteks.
3. Selesaikan matriks regresi Eternal light/dark dan preset undangan baru.
4. Jalankan audit realtime seluruh panel pada Eternal dan Seraya.
5. Jalankan matriks galeri dan overlay.
6. Uji RSVP, ucapan, hadiah, livestream, filter Instagram, dan penyimpanan draft end-to-end.
7. Baru tandai Eternal/Seraya siap jual setelah seluruh matriks lulus.
