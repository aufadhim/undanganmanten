import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getToken, clearToken } from '../api/client.js';

export default function Header({ variant = 'landing' }) {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = !!getToken();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    // If not on landing page, navigate to landing page first
    if (window.location.pathname !== '/') {
        navigate(`/#${id}`);
        // Give time for navigation before scrolling
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  return (
    <header className={`lp-header ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img src="/logo.png" alt="UndanganManten" style={{ height: 28, marginRight: 8 }} />
        UndanganManten
      </Link>

      <button className="lp-burger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      <nav className={`lp-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {variant === 'landing' && (
          <>
            <a href="#cara-kerja" onClick={(e) => handleScrollTo(e, 'cara-kerja')}>Cara Kerja</a>
            <a href="#fitur" onClick={(e) => handleScrollTo(e, 'fitur')}>{t('navbar.features')}</a>
            <a href="#harga" onClick={(e) => handleScrollTo(e, 'harga')}>{t('navbar.pricing')}</a>
            <Link to="/sandbox" onClick={() => setMobileMenuOpen(false)}>{t('navbar.themes')}</Link>
          </>
        )}
        
        {variant === 'dashboard' && (
          <>
            <a href="#">Bantuan</a>
          </>
        )}

        <button className="lp-lang" onClick={toggleLang}>
          <i className="fa-solid fa-globe"></i> {i18n.language.toUpperCase()}
        </button>

        {variant === 'landing' && isLoggedIn && (
          <Link to="/dashboard" className="lp-btn-seal">Ke Dashboard</Link>
        )}
        
        {variant === 'landing' && !isLoggedIn && (
          <>
            <Link to="/login" className="lp-btn-ghost">{t('navbar.login')}</Link>
            <Link to="/signup" className="lp-btn-seal">Mulai</Link>
          </>
        )}

        {variant === 'dashboard' && (
          <button className="lp-btn-seal" onClick={handleLogout}>
            {t('dashboard.logout') || 'Keluar'}
          </button>
        )}
      </nav>
    </header>
  );
}
