# Optimasi editor: pemuatan tema dan penyimpanan

- Apply preset tetap atomik di database, tetapi hanya mengembalikan id, themeId, dan themeSettings. Editor mempertahankan konten yang sudah dimuat; tidak mengambil ulang galeri, cerita, acara, dan data lain untuk perubahan tema saja.
- Semua tombol ganti tema dikunci selama permintaan berlangsung. Ref juga menahan klik ganda sebelum React menggambar ulang.
- Kode template disiapkan saat tombol diarahkan/fokus, bukan memuat semua 40 template di awal. Thumbnail menggunakan lazy loading dan decoding async.
- Bootstrap ketiga engine memakai konfigurasi lengkap yang sudah dikirim host editor. Fetch JSON tetap menjadi fallback ketika tidak ada host; peta landscape tetap diambil dari template masing-masing.
- PATCH pengaturan hanya menulis properti yang dikirim dan berubah. Permintaan tanpa perubahan mengembalikan nilai tersimpan tanpa write.
- Pembersihan media hanya dijadwalkan jika URL lama benar-benar dilepas. Unggah foto profil mengirim respons setelah data tersimpan, tanpa menunggu rekonsiliasi storage.
- Kegagalan penyimpanan tema tetap mengembalikan pilihan sebelumnya. Sukses baru ditampilkan sesudah server menjawab.

Tidak mengubah kuota, aset, data pengguna, atau kredensial. Tidak menjalankan build, tes, atau benchmark; pemeriksaan sintaks saja. Belum ada angka pengukuran latensi atau klaim persentase percepatan. Perubahan backend berlaku saat proses backend memuat ulang sumber.
