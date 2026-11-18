const origin = 'https://samavaya.web.id';

const discoveryLinks = `<nav class="search-nav" aria-label="Jelajahi Samavaya"><a href="/undangan/contoh">Contoh undangan</a><a href="/undangan/harga">Harga &amp; paket</a><a href="/undangan/buku-tamu-qr">Buku Tamu QR</a></nav>`;

export const searchPages = {
  '/': {
    title: 'Samavaya — Undangan Pernikahan Digital',
    description: 'Buat undangan pernikahan digital dengan pilihan tema dan desain yang bisa disesuaikan. Coba demo sebelum daftar, bandingkan paket mulai Rp99.000, dan kelola RSVP serta Buku Tamu QR.',
    body: `<div class="landing-first" data-landing-first>
      <header><a class="landing-first-brand" href="/" aria-label="Samavaya"><svg viewBox="0 0 40 40" width="39" height="39" fill="none" aria-hidden="true"><path d="M20 20C4 22 1 9 11 8c6-1 9 6 9 12Zm0 0C18 4 31 1 32 11c1 6-6 9-12 9Zm0 0c16-2 19 11 9 12-6 1-9-6-9-12Zm0 0c2 16-11 19-12 9-1-6 6-9 12-9Z" stroke="currentColor" stroke-width="1.8"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg><span>samavaya<small>SEBUAH KABAR BAHAGIA</small></span></a><a href="/login">Masuk</a></header>
      <main><section><p class="landing-first-kicker">UNDANGAN DIGITAL, DENGAN SENTUHAN PERSONAL</p><h1>Kisah kalian,<br>dilukis menjadi<br><em>kenangan.</em></h1><p>Buat undangan pernikahan digital dengan tema pilihan, RSVP online, dan opsi Buku Tamu QR. Bagikan undangan lewat WhatsApp.</p><a class="landing-first-action" href="/sandbox">Coba buat undangan</a><p class="landing-first-note">Coba desainnya dulu. Isi detailnya saat kalian siap. <a href="/guide">Baca panduan membuat undangan</a>.</p></section>
      <div class="landing-first-art" aria-hidden="true"><img src="/assets/landing-canvas/couple.webp" alt="" decoding="async"></div></main>
      ${discoveryLinks}
    </div>`,
  },
  '/guide': {
    title: 'Panduan Membuat Undangan Pernikahan Digital — Samavaya',
    description: 'Pelajari cara memilih tema, menerbitkan undangan, membagikan tautan pribadi, dan mengelola tamu di Samavaya.',
    body: `<h1>Panduan membuat undangan digital Samavaya</h1>
      <ol><li>Coba tema, lalu buat draft undangan.</li><li>Lengkapi nama pasangan, tanggal, jam, lokasi, dan alamat acara.</li><li>Periksa pratinjau, aktifkan paket, lalu terbitkan undangan.</li><li>Bagikan tautan dan pantau RSVP dari dashboard.</li></ol>
      <p>Jika Buku Tamu QR aktif, bagikan tautan pribadi kepada setiap tamu agar mereka bisa menunjukkan kode check-in saat datang.</p>
      <nav aria-label="Mulai"><a href="/">Beranda Samavaya</a> · <a href="/sandbox">Coba desain undangan</a> · <a href="/undangan/contoh">Lihat contoh undangan</a> · <a href="/undangan/harga">Bandingkan paket</a> · <a href="/undangan/buku-tamu-qr">Pelajari Buku Tamu QR</a></nav>`,
  },

  '/undangan/contoh': {
    standalone: true,
    title: 'Contoh Undangan Pernikahan Digital — Samavaya',
    description: 'Coba desain undangan digital Chromatica, Segelara, dan Gazette.',
    body: `<h1>Contoh undangan pernikahan digital</h1><p>Buka demo dan jelajahi isi undangan sebelum mendaftar.</p><div class="search-grid">
      <article><h2>Chromatica</h2><p>Ilustrasi cat air berlatar studio dengan adegan yang berpindah saat digeser.</p><a class="search-action" href="/sandbox?theme=urban-editorial">Coba Chromatica</a></article>
      <article><h2>Segelara</h2><p>Ketuk segel untuk membuka amplop, lalu gulir surat di atas tekstur kertas.</p><a class="search-action" href="/sandbox?theme=engine-4">Coba Segelara</a></article>
      <article><h2>Gazette</h2><p>Undangan bergaya editorial yang terinspirasi koran.</p><a class="search-action" href="/sandbox?theme=seraya">Coba Gazette</a></article></div>`,
  },
  '/undangan/harga': {
    standalone: true,
    title: 'Harga Undangan Pernikahan Digital — Samavaya',
    description: 'Bandingkan paket Standard, Premium, dan tambahan Buku Tamu QR.',
    body: `<h1>Harga undangan pernikahan digital</h1><p>Paket berlaku per undangan dan aktif hingga 30 hari setelah tanggal acara.</p><div class="search-grid">
      <article><h2>Standard</h2><strong>Rp99.000</strong><p>Hingga 10 foto dan 100 tamu.</p></article>
      <article><h2>Premium</h2><strong>Rp129.000</strong><p>Hingga 30 foto dan tanpa batas jumlah tamu dari paket.</p></article>
      <article><h2>Buku Tamu QR</h2><strong>Rp20.000</strong><p>Tambahan opsional untuk check-in tamu.</p></article></div>
      <h2>Apa yang didapat di kedua paket?</h2><p>Standard dan Premium mencakup editor undangan, RSVP, ucapan, hadiah, dan live streaming. Pilih Standard jika daftar tamu maksimal 100 orang dan galeri cukup dengan 10 foto. Pilih Premium jika perlu ruang untuk lebih banyak tamu atau hingga 30 foto.</p><p>Buku Tamu QR tersedia sebagai tambahan untuk pencatatan kedatangan di lokasi acara. Biaya layanan ditampilkan saat memilih metode pembayaran.</p><a class="search-action" href="/sandbox">Coba desain undangan</a>`,
  },
  '/undangan/buku-tamu-qr': {
    standalone: true,
    title: 'Buku Tamu Digital & Check-in QR — Samavaya',
    description: 'Bagikan QR pribadi kepada tamu, beri akses petugas meja, dan unduh laporan kehadiran.',
    body: `<h1>Buku tamu digital dengan check-in QR</h1><ol>
      <li>Bagikan tautan pribadi agar masing-masing tamu bisa membuka QR miliknya.</li>
      <li>Buat akses petugas meja dari dashboard. Petugas bisa memindai QR atau mencari nama dan mencatat jumlah orang yang datang.</li>
      <li>Unduh rekap Excel untuk diolah atau laporan PDF untuk dibagikan.</li></ol>
      <h2>Apa bedanya RSVP dan check-in?</h2><p>RSVP mencatat rencana hadir sebelum acara. Check-in mencatat siapa yang benar-benar datang dan berapa orang yang hadir. Jika tamu datang tanpa QR, petugas bisa mencari namanya.</p><a class="search-action" href="/guide">Lihat latihan Buku Tamu di Panduan</a>`,
  },
};

const landingFirstCss = `<style>
.landing-first{box-sizing:border-box;background:#f5f2e8;color:#384a37;min-height:100vh;font:14px/1.8 Manrope,Arial,sans-serif}
.landing-first *{box-sizing:border-box}.landing-first a{color:inherit;text-decoration:none}.landing-first header{max-width:1600px;margin:auto;height:94px;padding:0 5.2%;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #c5cdb7}
.landing-first-brand{display:flex;align-items:center;gap:11px;font:500 25px/.95 'Cormorant Garamond',Georgia,serif}.landing-first-brand svg{color:#78855f}.landing-first-brand small{display:block;font:600 6px/1 Arial,sans-serif;letter-spacing:.2em;margin-top:9px}
.landing-first main{max-width:1600px;min-height:790px;margin:auto;padding:34px 3% 98px 9%;display:grid;grid-template-columns:1fr 1.08fr;align-items:center}
.landing-first section{position:relative;z-index:1}.landing-first section>p{max-width:355px}.landing-first-kicker{font-size:8px;letter-spacing:.15em}.landing-first h1{font:400 clamp(65px,6.4vw,94px)/.99 'Cormorant Garamond',Georgia,serif;letter-spacing:-.055em;margin:29px 0 27px}.landing-first h1 em{color:#8a7450}
.landing-first a.landing-first-action{display:inline-flex;margin-top:16px;padding:13px 22px;background:#64734f;color:#fffdf4;border-radius:3px;font-size:12px}.landing-first-note{font-size:10px;margin-top:16px}.landing-first-note a{text-decoration:underline;text-underline-offset:2px}
.landing-first-art{min-height:620px;display:grid;place-items:center;background:url('/assets/landing-canvas/garden.webp') center/cover;mask-image:radial-gradient(ellipse,#000 45%,transparent 72%)}.landing-first-art img{display:block;width:min(60%,360px);height:auto}
@media(max-width:600px){.landing-first header{height:74px;padding:0 6%}.landing-first main{display:block;min-height:0;padding:45px 6% 24px;text-align:center}.landing-first section>p{margin-inline:auto}.landing-first h1{font-size:clamp(44px,13.6vw,77px)}.landing-first-art{min-height:390px;margin-top:12px}}
</style>`;

const discoveryCss = `<style>
.search-nav{display:flex;flex-wrap:wrap;gap:.6rem 1.2rem;padding:1.25rem 0}
.landing-first>.search-nav{max-width:1320px;margin:auto;padding-inline:6%}
.search-page{min-height:100vh;background:#f5f2e8;color:#384a37;padding:clamp(20px,6vw,80px);font:16px/1.65 system-ui,sans-serif;box-sizing:border-box}
.search-page>*{max-width:1040px;margin-inline:auto}.search-page a{color:#405536}
.search-page h1,.search-page h2{font-family:Georgia,serif;font-weight:400;line-height:1.16}.search-page h1{font-size:clamp(2rem,5vw,3.7rem)}
.search-page ol{padding-left:1.3rem}.search-page li+li{margin-top:.6rem}
.search-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,225px),1fr));gap:1rem;margin:1.5rem 0}
.search-grid article{border:1px solid #cbd0bd;border-radius:12px;background:#fbf9f1;padding:1.25rem}.search-grid h2{margin-top:0}
.search-page .search-action{display:inline-block;background:#465a3e;color:#fffdf4;padding:.55em 1em;border-radius:6px;text-decoration:none}
</style>`;

export function searchPageHtml(shell, pathname) {
  const page = searchPages[pathname];
  const url = origin + pathname;
  const metadata = `<title>${page.title}</title>
    <meta name="description" content="${page.description}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Samavaya">
    <meta property="og:title" content="${page.title}">
    <meta property="og:description" content="${page.description}">
    <meta property="og:url" content="${url}">
    ${pathname === '/' ? landingFirstCss : ''}
    ${pathname === '/' || page.standalone ? discoveryCss : ''}
    ${pathname === '/' ? `<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Samavaya","url":"${origin}/"}</script>` : ''}`;
  if (page.standalone) {
    return `<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">${metadata}</head>
      <body style="margin:0"><div class="search-page"><header><a href="/">Samavaya</a>${discoveryLinks}</header><main>${page.body}</main>
      <footer><p><a href="/guide">Panduan</a> · <a href="/contact">Kontak</a></p></footer></div></body></html>`;
  }
  return shell.replace(/<title>.*?<\/title>/s, () => metadata)
    .replace('<div id="root"></div>', () => pathname === '/'
      ? `<div id="root">${page.body}</div>`
      : `<div id="root"><main style="max-width:48rem;margin:auto;padding:2rem;font:16px/1.6 system-ui;color:#344633">${page.body}</main></div>`);
}

export const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(searchPages).map(path => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>`;

export const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Sitemap: ${origin}/sitemap.xml
`;
