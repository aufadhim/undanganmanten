# Wasesa — Immersia engine 3


## Burung Wasesa

Dua sprite sheet transparan dibuat dengan imagegen built-in, tiga pose sayap per burung. File final: `frontend/public/templates/wasesa/assets/sunbird-flight-v1.webp` dan `frontend/public/templates/wasesa/assets/dove-flight-v1.webp` (768×256). `birds.js` memasang empat penerbangan dengan arah, ukuran, dan tempo berbeda; animasi berhenti saat tab tersembunyi dan dimatikan untuk reduced motion.

### sunbird

Use case: illustration-story. Production animation sprite sheet for a romantic Javanese watercolor wedding invitation. TRUE TRANSPARENT BACKGROUND, no paper rectangle or checkerboard painted in, no shadows, no text or labels. Horizontal strip with exact aspect ratio 3:1, divided invisibly into THREE equal square cells. Same single small bird, right-facing side profile, in each cell. Identical body size and body center, head and tail alignment between all three cells. Only wing pose changes: left cell both wings raised high, middle cell wings extended horizontally, right cell wings lowered during downstroke. Each complete bird fits within its cell with 15% safety margin, no cropped wings or tails. Elegant hand painted watercolor, soft pigment edges and fine feather detail, muted colors, not photorealistic, no glossy 3D. No other objects. An olive-and-antique-gold sunbird with a small dusty burgundy throat, long delicate beak, warm cream belly.

### dove

Use case: illustration-story. Production animation sprite sheet for a romantic Javanese watercolor wedding invitation. TRUE TRANSPARENT BACKGROUND, no paper rectangle or checkerboard painted in, no shadows, no text or labels. Horizontal strip with exact aspect ratio 3:1, divided invisibly into THREE equal square cells. Same single small bird, right-facing side profile, in each cell. Identical body size and body center, head and tail alignment between all three cells. Only wing pose changes: left cell both wings raised high, middle cell wings extended horizontally, right cell wings lowered during downstroke. Each complete bird fits within its cell with 15% safety margin, no cropped wings or tails. Elegant hand painted watercolor, soft pigment edges and fine feather detail, muted colors, not photorealistic, no glossy 3D. No other objects. A small Javanese zebra dove, warm grey taupe feathers with subtle thin neck barring, ivory belly, no sharp black, graceful rounded wing feathers.


Wasesa adalah remake bernuansa Nawasena dengan engine landscape bersama. Nawasena lama tetap tersedia.

## Lokasi edit

- Peta, koordinat, landmark, dan tempo: `frontend/public/templates/wasesa/landscape.json`
- Warna dan gaya: `frontend/public/templates/wasesa/landscape.css`
- Konten/aset default: `frontend/src/components/templates/wasesa/defaultConfig.json` dan salinannya `frontend/public/templates/wasesa/config/invitation.json` (harus sama).
- Ilustrasi: `frontend/public/templates/wasesa/assets/`.
- Mesin bersama: `frontend/public/templates/mental-canvas-3/`.

Lima ilustrasi baru berformat WebP total sekitar 1,25 MB. Karakter Jawa dan bunga menggunakan aset Sogan yang sudah ada; frame menggunakan variasi ornamen Nawasena. Semua gambar mempertahankan rasio aslinya.

## Tempo engine 3

`motion.durationScale` default 1.6 (rentang 0.5–3). Perpindahan dalam area minimal 3.6 detik, lintas area maksimal 14 detik. Masuk sampul 4.8 detik, kembali langsung 1,6 detik. Reduced motion tetap 180 ms. Sapuan ivory berada pada layer konten, bukan mengubah ilustrasi.

## Prompt ilustrasi final

Referensi: `frontend/public/assets/nawasena/enchanted-joglo-hero.webp`, hanya sebagai acuan arsitektur dan mood. Dibuat dengan imagegen lalu diperkecil ke WebP; panorama 2172×724, area 1024×1024.

### panorama

Use case: illustration-story. New watercolor wedding invitation environment. The reference image establishes JAVANESE ARCHITECTURE AND MOOD only. Make this more clearly hand painted on cotton watercolor paper: loose pigment blooms, visible brush marks, soft atmospheric perspective. Muted ivory, antique gold, warm dusty brown teak, sage olive, and tiny dusty burgundy botanical accents, never saturated red or bright green. Authentic Central Javanese joglo architecture, tropical gardens, distant misty volcanic mountains, frangipani, jasmine, bamboo and palms. No European architecture. No photographic realism, no 3D render, no text, no people, no borders, no UI. Fully painted edges. A very wide horizontal 3:1 continuous panorama. Left: a small carved teak joglo behind an open garden path. Middle left: a lotus water court and old stone terrace. Middle right: a small bamboo footbridge crossing a quiet stream. Right: a lotus pond at soft sunset with a small garden pavilion. All areas are naturally connected by the same path and stream. Consistent horizon at middle height, soft ivory sky above, painted foliage around the sides. The entire landscape should read as one place, not separate panels.

### joglo

Use case: illustration-story. New watercolor wedding invitation environment. The reference image establishes JAVANESE ARCHITECTURE AND MOOD only. Make this more clearly hand painted on cotton watercolor paper: loose pigment blooms, visible brush marks, soft atmospheric perspective. Muted ivory, antique gold, warm dusty brown teak, sage olive, and tiny dusty burgundy botanical accents, never saturated red or bright green. Authentic Central Javanese joglo architecture, tropical gardens, distant misty volcanic mountains, frangipani, jasmine, bamboo and palms. No European architecture. No photographic realism, no 3D render, no text, no people, no borders, no UI. Fully painted edges. SQUARE 1:1 composition. A modest carved teak joglo on stone steps, seen at a respectful middle distance, ENTIRE roof and both eaves fitting inside CENTRAL 28% of image width. An open stone garden path in the foreground center for a couple illustration. Layered tropical foliage only at outer sides. Pale ivory morning sky fills upper 40%; misty mountains along a consistent horizon. Quiet, elegant Javanese garden.

### court

Use case: illustration-story. New watercolor wedding invitation environment. The reference image establishes JAVANESE ARCHITECTURE AND MOOD only. Make this more clearly hand painted on cotton watercolor paper: loose pigment blooms, visible brush marks, soft atmospheric perspective. Muted ivory, antique gold, warm dusty brown teak, sage olive, and tiny dusty burgundy botanical accents, never saturated red or bright green. Authentic Central Javanese joglo architecture, tropical gardens, distant misty volcanic mountains, frangipani, jasmine, bamboo and palms. No European architecture. No photographic realism, no 3D render, no text, no people, no borders, no UI. Fully painted edges. SQUARE 1:1 composition. A quiet Javanese lotus water court with an antique stone fountain and a little teak pendopo at middle distance. Entire fountain and small pendopo together fit CENTRAL 30% image width. A curving stone path follows the planted edge of water from left foreground to right background, jasmine and ivory frangipani. Soft warm ivory midday sky upper 40%, misty volcanic hills at horizon. Open edges of water and foliage at left and right for blending.

### bridge

Use case: illustration-story. New watercolor wedding invitation environment. The reference image establishes JAVANESE ARCHITECTURE AND MOOD only. Make this more clearly hand painted on cotton watercolor paper: loose pigment blooms, visible brush marks, soft atmospheric perspective. Muted ivory, antique gold, warm dusty brown teak, sage olive, and tiny dusty burgundy botanical accents, never saturated red or bright green. Authentic Central Javanese joglo architecture, tropical gardens, distant misty volcanic mountains, frangipani, jasmine, bamboo and palms. No European architecture. No photographic realism, no 3D render, no text, no people, no borders, no UI. Fully painted edges. SQUARE 1:1 composition. A complete elegant small arched bamboo and teak footbridge over the same stream in a Javanese garden. CRITICAL: BOTH ends, the entire arch, all railings and reflection fit CENTRAL 28% image width; this is a SMALL bridge within a wide garden, not a close-up. River curves from left to right, bamboo stands and palms at far outer sides, jasmine and pale frangipani along banks. Upper 40% pale warm sky; misty volcanic hills beyond.

### pond

Use case: illustration-story. New watercolor wedding invitation environment. The reference image establishes JAVANESE ARCHITECTURE AND MOOD only. Make this more clearly hand painted on cotton watercolor paper: loose pigment blooms, visible brush marks, soft atmospheric perspective. Muted ivory, antique gold, warm dusty brown teak, sage olive, and tiny dusty burgundy botanical accents, never saturated red or bright green. Authentic Central Javanese joglo architecture, tropical gardens, distant misty volcanic mountains, frangipani, jasmine, bamboo and palms. No European architecture. No photographic realism, no 3D render, no text, no people, no borders, no UI. Fully painted edges. SQUARE 1:1 composition. A serene lotus pond in a Javanese garden at muted ivory-gold dusk, a little teak gazebo fitting CENTRAL 25% image width, lotus pads and ivory lotus blossoms in calm water. A broad grounded pale stone terrace occupies lower quarter and is open at center so a couple illustration can stand there. Frangipani and jasmine at outer sides, warm dusty brown wood and sage palms. Soft peach-ivory sky fills upper 40%, misty volcanic hills. No harsh orange or saturated colors.

