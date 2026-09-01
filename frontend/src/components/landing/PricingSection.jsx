import { Link } from 'react-router-dom';

export default function PricingSection() {
  return (
    <section id="harga" className="pricing">
      <div className="section-head reveal">
        <div className="eyebrow center">Kartu Balasan</div>
        <h2>Satu Paket Lengkap, Harga Jelas</h2>
        <p className="section-sub">Bayar sekali, undangan aktif hingga 30 hari setelah acara.</p>
      </div>

        <div className="ticket-grid" style={{ maxWidth: 520, marginInline: 'auto' }}>
        <div className="ticket highlighted reveal">
          <div className="ticket-flag">Paket Lengkap</div>
          <div className="ticket-body">
            <div className="ticket-name">Undangan Digital Premium</div>
            <div className="ticket-price">Rp119.000</div>
            <div className="ticket-period">Aktif hingga H+30</div>
            <ul>
              <li>Aktif hingga 30 hari setelah acara</li>
              <li>Semua tema dan editor realtime</li>
              <li>Galeri foto dan video</li>
              <li>RSVP dan daftar tamu tanpa batas</li>
              <li>Ucapan, hadiah, dan live streaming</li>
              <li>Tambah Buku Tamu QR Scanner: <strong>Rp20.000</strong></li>
            </ul>
          </div>
          <div className="ticket-perf" />
          <div className="ticket-stub">
            <Link to="/sandbox" className="lp-btn-seal full">Masuk ke Mode Coba</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
