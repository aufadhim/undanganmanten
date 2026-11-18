# Audit latar hitam — 2 November 2026

Penyebab: heroLayers di engine rooms dan book menyaring seluruh lapisan dengan opacity 0. Latar ruang 2–4 memang dimulai dengan opacity 0, sehingga ikut dibuang sebelum kamera memasukinya. Teks tetap tampil, tetapi renderer hanya memiliki dasar hitam.

Perbaikan: lapisan dengan properti room selalu dipertahankan; foreground yang sengaja dimatikan tetap dapat disaring. Engine landscape tidak menggunakan filter bermasalah tersebut.

Template yang memakai kode terdampak (26):
- Engine 1: Swarnalaya
- Engine 2: Hikayat
- Engine 1: Paseban
- Engine 1: Paduraksa
- Engine 2: Sylvatica
- Engine 1: Phinisi
- Engine 2: Lignum
- Engine 2: Nirwana
- Engine 1: Pusaka
- Engine 1: Mihrab
- Engine 2: Sahifah
- Engine 1: Aureole
- Engine 2: Canticle
- Engine 1: Lianhua
- Engine 2: Porcelaine
- Engine 2: Reverie
- Engine 2: Mayfair
- Engine 1: Alabaster
- Engine 2: Velours
- Engine 2: Vellum
- Engine 1: Cinematique
- Engine 2: Sovereign
- Engine 1: Nocturne
- Engine 2: Pramaya
- Engine 1: Viridarium
- Engine 1: Sogan

Validasi: node --test frontend/tests/room-backgrounds.test.js lolos untuk seluruh 26 konfigurasi engine 1/2, memeriksa empat latar, opacity awal, dan keberadaan berkas. Pemeriksaan browser Hikayat pada countdown menunjukkan latar ruang kedua kembali tampil. Ini bukan pemeriksaan visual seluruh bagian semua template.

## Promenade
Palem pada panorama metropolitan diganti pepohonan jalan berdaun lebar melalui built-in imagegen. Aset aktif memakai environment-v3.webp dan empat environment-zone-N-v3.webp di frontend/public/templates/urban-editorial/assets. Konfigurasi sumber dan thumbnail diperbarui melalui sinkronisasi registry.

Prompt edit: Remove ALL coconut, oil palm, date palm, and other palm trees throughout the existing watercolor metropolitan panorama; replace with modest broadleaf street trees. Preserve the continuous 3:1 composition, architecture, pavement perspective, daylight, colors, and watercolor paper style. No people, text, UI, or new props.
