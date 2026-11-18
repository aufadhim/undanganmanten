# Immersia — skala, pijakan, dan kedalaman

Kalibrasi 2 November 2026 untuk 40 template Immersia. Tidak ada ilustrasi baru, perubahan database, atau perubahan tipografi/sapuan ivory.

## Patokan bawaan

Pada viewport acuan 390 × 844:

| Penempatan | Tinggi tubuh yang benar-benar terlihat | Pijakan |
|---|---:|---|
| Sampul | 43% tinggi viewport | sekitar 78% tinggi viewport |
| Hero | 48% | sekitar 83% |
| Penutup | 40% | sekitar 94% |

Yang diukur adalah batas alpha ilustrasi (ambang 32/255), bukan ukuran kotak PNG/WebP. Penyesuaian kamera landscape dapat menghasilkan pergeseran kecil pijakan; nilainya dicatat di laporan JSON. Angka tersebut merupakan default; ukuran/posisi tersimpan milik pengguna tetap diterapkan sebagai penyesuaian.

## Koreksi engine

- Batas tubuh dan titik kaki diukur ulang dari satu aset pasangan yang dipakai semua penempatan. Profil menggunakan batas tubuh yang sama. Metadata penutup yang berasal dari pose lama tidak dipakai lagi.
- Latar engine 1/2 dikalibrasi pada kamera acuan yang tetap. Latar tidak lagi membesar dan bergeser otomatis untuk mengikuti posisi kamera setiap frame; perubahan perspektif antara figur dan lukisan kembali terlihat.
- Area sampul/penutup engine 1 menyisakan cakupan lukisan lebih besar untuk perjalanan kamera exterior.
- Engine 3 menghitung kamera dan figur pada area lukisan yang sama, termasuk pembatasan kamera pada tepi dunia. Kamera panorama dan koordinat bagian lain tetap dipertahankan.
- Bayangan kontak mengikuti kaki yang terlihat. Resize memperhitungkan margin transparan. Posisi penutup dihitung terhadap kamera penutup sebenarnya.
- Tidak ada ukuran properti yang diubah terpisah dari lukisan. Referensi perspektif per template dipertahankan dari metadata pengarahan gambar yang ada: tinggi manusia relatif pada pintu/pagar/tangga dan garis horizon. Itu perkiraan pengarahan gambar, bukan pengukuran objek 3D yang pasti. Penilaian visual properti yang menyatu dalam background tetap dilakukan pemilik proyek.

## Sumber dan cara mengubah

- `shared/template-scenes/<folder>.json`: sumber utama. Lihat `invitation.composition.grounding`, `composition.cover/hero/closing.scaleGuide`, `composition.art`, dan `layout`. Untuk engine 3, lihat `landscape.characters` serta stops cover/hero/penutup.
- `docs/IMMERSIA_GROUNDING_CALIBRATION.json`: laporan setiap template, batas alpha, perspektif, dan pijakan akhir.
- `tools/calibrate-immersia-grounding.mjs`: regenerasi kalibrasi default seluruh 40 template. Menjalankannya ulang menimpa penyetelan manual default terkait ukuran dan posisi pada sumber scene; gunakan hanya ketika memang ingin mengkalibrasi ulang seluruh katalog.
- Setelah edit sumber, jalankan `node tools/sync-template-registry.cjs` untuk menghasilkan konfigurasi runtime dan frontend.

## Validasi

`node --test frontend/tests/grounding-contract.test.js frontend/tests/transition-motion.test.js frontend/tests/room-backgrounds.test.js`

9 pengujian lolos: ukuran/pijakan seluruh 40 template pada viewport acuan, posisi bayangan saat resize, geometri latar yang tetap, serta regresi transisi dan latar ruang. Nilai layout juga diperiksa tetap berada dalam batas konfigurasi. Pemeriksaan visual satu per satu diserahkan kepada pemilik proyek sesuai kesepakatan.
