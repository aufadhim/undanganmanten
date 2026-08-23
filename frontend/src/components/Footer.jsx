import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer({ variant = 'landing' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
        navigate(`/#${id}`);
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={`lp-footer ${variant === 'dashboard' ? 'dashboard-mode' : ''}`} style={variant === 'dashboard' ? { padding: '32px 6%' } : {}}>
      <div className="footer-inner" style={variant === 'dashboard' ? { margin: 0, justifyContent: 'space-between', alignItems: 'center' } : {}}>
        {variant === 'landing' ? (
          <>
            <div className="footer-brand">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <h3>
                  <img src="/logo.png" alt="" style={{ height: 24, marginRight: 8, filter: 'brightness(0) invert(1)' }} />
                  UndanganManten
                </h3>
              </Link>
              <p>{t('footer.desc', 'Undangan digital yang benar-benar dibuka, bukan disimpan di laci.')}</p>
              <div className="social-links">
                <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                <a href="#" aria-label="TikTok"><i className="fa-brands fa-tiktok"></i></a>
                <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              </div>
            </div>
            <div className="footer-col">
              <h4>{t('footer.product', 'Produk')}</h4>
              <a href="#fitur" onClick={(e) => handleScrollTo(e, 'fitur')}>{t('navbar.features', 'Fitur Utama')}</a>
              <a href="#harga" onClick={(e) => handleScrollTo(e, 'harga')}>{t('navbar.pricing', 'Harga & Paket')}</a>
              <Link to="/sandbox">{t('navbar.themes', 'Katalog Tema')}</Link>
            </div>
            <div className="footer-col">
              <h4>Bantuan</h4>
              <a href="#">Tanya via WhatsApp</a>
              <a href="#">FAQ & Cara Pakai</a>
              <a href="#">Hubungi Tim Support</a>
            </div>
            <div className="footer-col">
              <h4>{t('footer.legal', 'Legal')}</h4>
              <Link to="/terms">{t('footer.terms', 'Syarat & Ketentuan')}</Link>
              <Link to="/privacy">{t('footer.privacy', 'Kebijakan Privasi')}</Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '13px', color: 'rgba(250,243,227,0.6)' }}>
              <span>&copy; {new Date().getFullYear()} UndanganManten</span>
              <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>{t('footer.terms', 'Syarat & Ketentuan')}</Link>
              <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>{t('footer.privacy', 'Kebijakan Privasi')}</Link>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: 'rgba(250,243,227,0.6)', textDecoration: 'none', fontSize: '13px' }}>Bantuan</a>
              <a href="#" style={{ color: 'rgba(250,243,227,0.6)', textDecoration: 'none', fontSize: '13px' }}>WhatsApp</a>
            </div>
          </>
        )}
      </div>
      
      {variant === 'landing' && (
        <div className="footer-bottom">&copy; {new Date().getFullYear()} UndanganManten. Semua hak dilindungi.</div>
      )}
    </footer>
  );
}
