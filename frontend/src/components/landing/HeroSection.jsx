import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HeroSection({ setMobileMenuOpen }) {
  const { t } = useTranslation();
  return (
    <section className="hero">
      <div className="hero-grain" />
      <div className="hero-inner">
        <div className="hero-copy reveal">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {t('landingHero.eyebrow')}
          </div>
          <h1>
            {t('landingHero.titleBefore')} <em>{t('landingHero.titleAccent')}</em>.<br />
            {t('landingHero.titleAfter')}<br />{t('landingHero.titleLast')}
          </h1>
          <p>
            {t('landingHero.description')}
          </p>
          <div className="hero-actions">
            <Link to="/sandbox" className="lp-btn-seal lg">{t('landingHero.try')}</Link>
            <Link to="/sandbox" className="lp-btn-ghost lg" onClick={() => setMobileMenuOpen(false)}>{t('landingHero.example')}</Link>
          </div>
          <div className="hero-proof">
            <div className="proof-stat">
              <strong>{t('landingHero.proofOneTitle')}</strong>
              <span>{t('landingHero.proofOneText')}</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-stat">
              <strong>{t('landingHero.proofTwoTitle')}</strong>
              <span>{t('landingHero.proofTwoText')}</span>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal" style={{ transitionDelay: '0.15s' }}>
          <div className="invite-stage">
            <div className="invite-ribbon" />
            <div className="invite-card">
              <div className="invite-card-inner">
                <div className="invite-eyebrow">Undangan Pernikahan</div>
                <div className="invite-names">Arunika &amp; Deva</div>
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
                <div className="ppb-names">Arunika &amp; Deva</div>
                <div className="ppb-btn">Buka Undangan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
