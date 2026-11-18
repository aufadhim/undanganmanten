import { useTranslation } from 'react-i18next';

export default function LangSwitcher({ style = {}, className = '' }) {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');
  };

  return (
    <button 
      type="button"
      className={`atelier-language ${className}`}
      onClick={toggleLang} 
      style={{
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        padding: '6px 12px',
        borderRadius: '20px',
        color: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
        ...style
      }}
      title="Ubah Bahasa / Change Language"
    >
      <i className="fa-solid fa-globe"></i> 
      {i18n.language.toUpperCase()}
    </button>
  );
}
