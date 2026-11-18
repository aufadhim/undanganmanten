# Human-scale revision v3

Scope: all 34 new templates; existing six packs retain their previous composition.

The previous revision sized people against the viewport but did not bind that decision to the environment. This revision records a separate painted-scale guide for every template, with an explicit reference object (door, chair, railing, steps, etc.) and foreground foot point. These are visual estimates from painted perspective, not measured real-world dimensions.

`tools/calibrate-template-human-scale.cjs` writes both runtime and React configuration copies. `output/template-composition/human-scale-references.json` contains the editable assumptions. Run this authoring step after previous composition scripts.

Engine 1/2: the fitted environment uses scaleGuide to relate painted adult height to full-body projected size and align its painted ground point to the foot line. Engine 1's external closing stage switches to the closing guide instead of keeping the opening guide. Extra rectangular frames stay disabled. Minimum environment coverage prevents gaps at viewport edges.

Engine 3: cover, hero and closing cameras now derive their distance from the same painted-scale relation, rather than using a close landscape camera with independently sized actors. Actor cutout bounds determine actual head-to-foot size. The character remains in the same scene; feet and contact shadow follow the baseline. No character proportions are stretched and no replacement characters are generated.

Host adapter recognizes v3 while retaining the authored closing baseline; saved editor offsets are additive. Existing explicit user scale/position adjustments remain active and may still intentionally change a particular invitation's composition.

Visual authoring review: inspected source background sheets and static background/couple compositions for all 34 packs. These were asset/composition reviews, not browser screenshots. No automated tests/build/browser QA were run, following the staged workflow. Device-specific live composition remains to be reviewed.

## Playful — acuan Ludora

Empat pack baru Playful (Meadow, Promenade, Chromatica, Nocturne) kini memakai ukuran tubuh dari alpha bounds Ludora: cover 42,87% tinggi viewport dengan kaki pada 76,34%; hero 48,12% dengan kaki pada 81,43%. Ludora tidak diubah. Ground point pada lukisan digeser menuju bidang yang lebih jauh ketika tubuh diperkecil, agar skala bukan sekadar mengecilkan karakter di foreground yang sama. Penutup memakai tubuh 40% dan kaki 94%.

Authoring ulang: jalankan `tools/calibrate-playful-ludora.cjs` setelah kalibrasi umum. Tiga puluh pack baru lainnya tidak mendapat ukuran Playful ini. Belum browser QA/build.

## Seluruh 34 pack — sampul/hero mengikuti Ludora

`tools/apply-ludora-opening-scale.cjs` kini menerapkan cover 42,87% dan hero 48,12% kepada semua 34 pack baru pada viewport referensi HP 390 × 844. Ukuran diukur pada alpha bounds tubuh, bukan termasuk margin transparan gambar. Kaki mengikuti referensi Ludora: 76,34% dan 81,43% tinggi viewport.

Reference guide per lukisan tetap dipertahankan. Ground point dan estimasi tinggi manusia pada kedalaman tersebut disesuaikan bersama ukuran tubuh, sehingga karakter tidak sekadar dikecilkan di bidang foreground yang sama. Engine 3 menghitung ulang kamera dari bidang ini; engine 1/2 meneruskan guide ke renderer latar. Snapshot sampul engine 2 mengoreksi rasio tinggi cover terhadap hero sebelum masuk buku.

Langkah ini idempotent melalui baseGuide, mempertahankan penutup, serta tidak mengubah enam template awal. Jalankan setelah script kalibrasi umum/Playful sebelumnya. Ini target framing default HP; pengaturan scale/offset yang pernah disimpan pengguna tetap dapat mengubah hasil undangan tertentu. Tidak menjalankan build atau browser QA pada tahap ini.
