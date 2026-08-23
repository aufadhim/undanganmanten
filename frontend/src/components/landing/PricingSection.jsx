import { Link } from 'react-router-dom';

export default function PricingSection() {
  return (
    <section id="harga" className="pricing">
      <div className="section-head reveal">
        <div className="eyebrow center">Kartu Balasan</div>
        <h2>Tiga Paket, Satu Kebahagiaan</h2>
        <p className="section-sub">Bayar sekali, undangan aktif hingga 30 hari setelah acara.</p>
      </div>

        <div className="ticket-grid">
        <div className="ticket reveal">
          <div className="ticket-body">
            <div className="ticket-name">Trial</div>
            <div className="ticket-price">Gratis</div>
            <div className="ticket-period">Untuk mencoba-coba</div>
            <ul>
              <li>Masa trial 2 hari</li>
              <li>Hanya bisa dilihat di Preview (Tidak bisa dipublish)</li>
              <li>Galeri maksimal 10 media</li>
              <li>Batas undangan 10 tamu</li>
              <li>Watermark UndanganManten</li>
            </ul>
          </div>
          <div className="ticket-perf" />
          <div className="ticket-stub">
            <Link to="/signup" className="lp-btn-ghost full">Coba Trial</Link>
          </div>
        </div>

        <div className="ticket highlighted reveal" style={{ transitionDelay: '0.1s' }}>
          <div className="ticket-body">
            <div className="ticket-name">Standard</div>
            <div className="ticket-price">Rp79.000</div>
            <div className="ticket-period">Aktif hingga H+30</div>
            <ul>
              <li>Aktif hingga 30 hari setelah acara</li>
              <li>Bebas Pilih Semua Tema</li>
              <li>Maksimal 10 media galeri</li>
              <li>RSVP Maksimal 100 Tamu</li>
              <li>Terdapat Watermark Elegan</li>
            </ul>
          </div>
          <div className="ticket-perf" />
          <div className="ticket-stub">
            <Link to="/signup" className="lp-btn-seal full">Pilih Standard</Link>
          </div>
        </div>

        <div className="ticket highlighted reveal" style={{ transitionDelay: '0.2s', borderColor: 'var(--wine)' }}>
          <div className="ticket-flag">Paling Laris</div>
          <div className="ticket-body">
            <div className="ticket-name">Premium</div>
            <div className="ticket-price">Rp129.000</div>
            <div className="ticket-period">Aktif hingga H+30</div>
            <ul>
              <li>Aktif hingga 30 hari setelah acara</li>
              <li>Semua fitur Standard</li>
              <li>Maksimal 30 media galeri</li>
              <li>RSVP Tamu <strong>Unlimited</strong></li>
              <li><strong>Buku Tamu QR Code Scanner</strong></li>
              <li>Amplop digital &amp; live streaming</li>
            </ul>
          </div>
          <div className="ticket-perf" />
          <div className="ticket-stub">
            <Link to="/signup" className="lp-btn-seal full">Pilih Premium</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
