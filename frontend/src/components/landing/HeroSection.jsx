import { Link } from 'react-router-dom';

export default function HeroSection({ setMobileMenuOpen }) {
  return (
    <section className="hero">
      <div className="hero-grain" />
      <div className="hero-inner">
        <div className="hero-copy reveal">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Undangan Pernikahan Digital
          </div>
          <h1>
            Undangan yang <em>Dibuka</em>.<br />
            Bukan yang Ditumpuk<br />di Laci.
          </h1>
          <p>
            Undangan kertas cuma dilipat, disimpan, lalu dilupakan. Yang ini dikirim lewat WhatsApp,
            dibuka di genggaman, dan langsung bisa dibalas — RSVP dan ucapan masuk sendiri ke dashboardmu.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="lp-btn-seal lg">Buat Undangan — Gratis</Link>
            <Link to="/sandbox" className="lp-btn-ghost lg" onClick={() => setMobileMenuOpen(false)}>Lihat Contoh Undangan</Link>
          </div>
          <div className="hero-proof">
            <div className="proof-stat">
              <strong>12.482</strong>
              <span>tamu bilang "Hadir ✓" bulan ini</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <strong>4 menit</strong>
              <span>rata-rata waktu bikin undangan</span>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal" style={{ transitionDelay: '0.15s' }}>
          <div className="invite-stage">
            <div className="invite-ribbon" />
            <div className="invite-card">
              <div className="invite-card-inner">
                <div className="invite-eyebrow">Undangan Pernikahan</div>
                <div className="invite-names">Rea &amp; David</div>
                <div className="invite-line" />
                <div className="invite-date">Sabtu, 20 Desember 2026</div>
              </div>
            </div>
            <div className="wax-seal">
              <i className="fa-solid fa-heart" />
            </div>
            <div className="phone-peek">
              <div className="phone-peek-notch" />
              <div className="phone-peek-body">
                <div className="ppb-label">The Wedding Of</div>
                <div className="ppb-names">Rea &amp; David</div>
                <div className="ppb-btn">Buka Undangan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
