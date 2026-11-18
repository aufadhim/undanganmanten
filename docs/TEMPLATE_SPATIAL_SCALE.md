# Skala dan pijakan template aktif — 1 November 2026

## Cakupan
Audit katalog aktif: Viridarium, Sogan, Pramaya, Riviera, Wasesa, Ludora, Nawasena, Eternal, Seraya. Template arsip tidak diubah.

- Viridarium / Sogan / Pramaya: contact shadow memakai tinggi gambar yang benar setelah decode, mengikuti x/y/lebar/opacity pasangan saat transisi dan pengaturan realtime. Penutup Viridarium diturunkan ke bidang jalan; opacity ilustrasi penutup penuh. Sogan memakai skala penutup 95%, bukan 72%, dengan anchor kaki tetap. Pramaya mempertahankan buku sebagai objek luar; pasangan hanya di ruang dalam.
- Riviera / Wasesa: panjang dunia dan jarak horizontal antar landmark dipertahankan. Area lukisan digeser vertikal ke y=-1800, pasangan pada z=-1800 (latar -2200), coverWidth 1400 / heroWidth 1450, closingScale .95. Selisih depth kini kecil sehingga ukuran relatif pasangan tidak berubah drastis ketika kamera mengambil panorama. Bunga foreground dibuat lebih kecil dan ditaruh di sisi jalan, bukan bidang dekat yang membesar berlebihan. Lantai bayangan mengikuti tubuh, bukan gambar jalan besar yang ditempel di bawah.
- Ludora: skala pasangan yang sudah disetujui tetap; contact shadow memakai helper bersama.
- Seluruh cover yang memakai cover-ambience: lebar ornamen tepi dibatasi maksimal 180px (dan 30% container), sehingga bunga tidak menjadi raksasa pada desktop.
- Nawasena: tinggi bunga depan dibatasi dan posisi bertumpu pada bawah scene; potret tetap dalam frame foto. Eternal / Seraya ditinjau sebagai komposisi foto/editorial, bukan cutout yang ditempel ke dunia 3D; foto tidak diperbesar secara paksa atau diberi bayangan tanah palsu.

## Kontrak implementasi
`frontend/public/templates/shared/character-grounding.js` adalah helper contact shadow dan resize yang menjaga garis kaki. Shadow berada hanya dua unit di belakang pasangan, tidak memakai depth background. Gunakan tinggi hasil decode dan aspect ratio asli; jangan mengasumsikan foto selalu 2:3 untuk penempatan shadow.

Engine 3 `world.js` menghitung batas area terhadap origin y area, bukan selalu nol. Ini penting untuk landmark yang digeser vertikal: kamera framing tidak boleh memangkas bagian atas/bawahnya.

Engine 1–2 memakai helper yang sama di cover / komposisi hero dan slider live. Cover-stage mempertahankan ground plane 3D; shadow pasangan mengikuti posisi dan ukurannya, bukan ukuran tetap yang terpisah.

Ukuran/posisi khusus yang disimpan pengguna tidak dihapus. Reset penutup harus mengikuti nilai tema. Jika pengguna sengaja mengubah posisi, editor tetap memberi mereka kontrol tersebut.

## Validasi
Tes regresi memeriksa foot line ketika resize, shadow tidak terlepas ketika kamera zoom, opacity contact, ukuran relatif orang terhadap landscape pada enam viewport, framing landmark dan batas dunia. Pemeriksaan visual memakai fixture `frontend/tests/fixtures/landscape-engine-check.html?theme=...` dengan data contoh dan wrapper produksi. Fixture juga mendukung ketiga Signature; gunakan kontrol aslinya untuk membuka undangan.

Angka world bukan ukuran meter. Landmark/ornamen hasil lukisan tetap harus diperiksa visual terhadap subjek saat mengganti art pack; lolos tes koordinat saja tidak menjamin perspektif lukisan baru benar.
