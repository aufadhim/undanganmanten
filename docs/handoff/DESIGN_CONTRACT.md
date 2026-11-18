# Kontrak desain dan produk

## Visual dan gerakan
- Cat air pada canvas/kertas, pigmen bertekstur, warna lembut tetapi tetap jelas. Bukan fotorealistik atau warna AI terlalu tajam.
- Pasangan menjadi fokus. Ilustrasi cover dan hero boleh berbeda, pose natural, wajah dan proporsi referensi personal tidak diganti tanpa permintaan.
- Skala properti masuk akal. Jangan membuat manusia mini di jalan batu raksasa, topi sebesar manusia, kaki melayang, tepi layer terpotong terlihat, atau gambar stretch.
- Dunia berlapis depan/tengah/belakang; kamera terasa menjelajah tempat yang menyatu. Hindari perpindahan ruang berlebihan.
- Scroll pertama segera memberi respons, satu gesture satu tujuan; jangan menumpuk antrian scroll yang bergerak sendiri sesudahnya. Gerakan antarbagian tenang. Kembali ke sampul boleh cepat, tetap mulus.
- Cover intro menunggu aset siap, kemudian ambience hidup (daun, bunga, burung/kupu-kupu sesuai tema), gerakan organik, bukan jentik acak. Hormati reduced motion dan pause saat halaman tidak aktif.
- Sapuan putih ivory dengan tepi blur hanya di sekitar teks. Jangan membuat cloud/card putih besar menutup seluruh ilustrasi. Hero harus tetap punya subtitle, nama pasangan, tanggal.

## Isi dan kontrol
- Body baseline 11px; heading cover/hero baseline 46px. Ini baseline CSS, bukan jaminan ukuran hasil transform/setting pengguna. Audit computed size pada viewport HP. Hindari uppercase paksa untuk label/tanggal yang telah disepakati sentence/title case.
- Ukuran/jarak teks per bagian di **Konten**; jenis font global di **Desain**. Reset harus benar-benar mereset preview dan data, bukan slider saja. Hindari respons simpan lama menimpa preview baru.
- Ilustrasi: karakter bawaan atau unggahan sendiri. Fitur generate AI dari foto sudah dihapus. Cover/hero bisa satu gambar dengan posisi terpisah atau dua gambar. Marker kepala untuk arah kamera profil hero. Slider realtime; simpan data mengikuti UX CMS yang ada.
- Navigasi bawah berupa dots kecil, aktif lebih besar, bisa digeser horizontal. Tidak ada pil putih lebar, hamburger, tombol next di tiap bagian, nama pasangan pojok kiri, label pratinjau, nama template, monogram, teks petunjuk vertikal, atau replay/pause animasi.
- Musik mulai sesudah Open Invitation, kontrol play/pause empat bar halus tanpa ripple; otomatis pause pindah tab/aplikasi.
- Galeri shared: 6 layout, collage tiga kolom tetap tidak beraturan. Foto muat area tanpa scroll kecuali slideshow. Video strip sendiri di bawah, selebar container foto, tanpa caption tambahan; satu lightbox bersama.
- Countdown angka jelas; SaveTheDate memakai komponen bersama. Akad/resepsi satu bagian: bila lokasi/alamat/maps sama, tampil satu lokasi dan dua jam. Jika beda, dua detail. Label Akad (tanpa Nikah), tombol maps styled.
- RSVP + ucapan satu bagian, area cukup luas untuk membaca ucapan; tidak ada input nomor WA publik. Judul/subjudul jangan hilang ketika panel diskrol. Backend authorization/guest limit tetap berlaku.
- Hadiah rekening/alamat tersembunyi dulu, dibuka atas tindakan tamu. Jangan memuat rekening nyata di template contoh.
- Penutup: teks di atas, pasangan di bawah menapak, posisi/ukuran bisa diatur. Nama bulan lengkap, tombol kembali ke sampul dan FooterBrand.
- Filter/bingkai off saat undangan baru; frame mengikuti karakter tema. Tidak menjanjikan filter Instagram AR otomatis.
- Notifikasi simpan/unggah/status memakai toast terlihat. Konsisten tombol, jarak, dropdown chevron, dan responsive editor.

## Data dan aset
Jangan menyimpan demo sebagai data pelanggan, jangan menyertakan key. Upload ke storage, bukan blob foto dalam database. Gunakan aset mobile terkompresi dengan alpha bila perlu, pertahankan kualitas sesuai ukuran layar dan zoom. Video besar diarahkan YouTube unlisted. Periksa limit aktual pada source sebelum mengubahnya.
