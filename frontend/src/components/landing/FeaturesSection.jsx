export default function FeaturesSection() {
  return (
    <section id="fitur" className="features">
      <div className="section-head reveal">
        <div className="eyebrow center">Yang Kamu Dapat</div>
        <h2>Semua yang Dibutuhkan Sebuah<br />Undangan, Jadi Satu Tempat</h2>
      </div>

      <div className="bento">
        <div className="bento-card wide reveal">
          <div className="bento-copy">
            <h3><i className="fa-brands fa-whatsapp" /> Satu Klik, Semua Tamu Kebagian</h3>
            <p>Upload daftar tamu, klik kirim — link undangan personal meluncur ke WhatsApp masing-masing, tanpa copy-paste satu-satu.</p>
          </div>
          <div className="bento-visual">
            <div className="wa-bubble">
              <span>Yth. Bapak/Ibu Sutrisno, kami mengundang Bapak/Ibu pada acara pernikahan kami...</span>
            </div>
          </div>
        </div>

        <div className="bento-card reveal" style={{ transitionDelay: '0.08s' }}>
          <div className="bento-copy">
            <h3><i className="fa-regular fa-calendar-check" /> Tahu Persis Siapa yang Datang</h3>
            <p>RSVP masuk real-time, lengkap dengan jumlah tamu yang dibawa.</p>
          </div>
          <div className="rsvp-tally">
            <div className="tally-row"><span>Hadir</span><strong>128</strong></div>
            <div className="tally-row muted"><span>Menunggu</span><strong>34</strong></div>
          </div>
        </div>

        <div className="bento-card reveal" style={{ transitionDelay: '0.16s' }}>
          <div className="bento-copy">
            <h3><i className="fa-regular fa-images" /> Kenangan Tanpa Batas Ukuran</h3>
            <p>Foto & video dikompres otomatis — kualitas tetap cantik, tanpa bikin undangan lemot.</p>
          </div>
          <div className="mini-gallery">
            <span /><span /><span />
          </div>
        </div>

        <div className="bento-card wide reveal" style={{ transitionDelay: '0.24s' }}>
          <div className="bento-copy">
            <h3><i className="fa-solid fa-swatchbook" /> Warna, Font, Layout — Semua Bisa Diubah</h3>
            <p>Ganti tema kapan saja tanpa kehilangan data yang sudah diisi. Preview-nya langsung terlihat, real-time.</p>
          </div>
          <div className="swatch-row">
            <span className="sw" style={{ background: 'var(--gold)' }} />
            <span className="sw" style={{ background: 'var(--wine)' }} />
            <span className="sw" style={{ background: '#3f5c3f' }} />
            <span className="sw" style={{ background: '#1f3a5f' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
