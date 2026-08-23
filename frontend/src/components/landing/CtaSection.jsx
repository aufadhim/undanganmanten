import { Link } from 'react-router-dom';

export default function CtaSection() {
  return (
    <section className="cta-seal reveal">
      <div className="cta-seal-inner">
        <div className="big-seal">
          <i className="fa-solid fa-heart" />
        </div>
        <h2>Waktunya Cap Sah Undangan Kalian</h2>
        <p>Gratis untuk mulai, tanpa kartu kredit. Selesai dalam hitungan menit, bukan hari.</p>
        <Link to="/signup" className="lp-btn-seal lg">Buat Undangan Sekarang</Link>
      </div>
    </section>
  );
}
