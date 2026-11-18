import { Link } from 'react-router-dom';
import Brand, { Flower } from './Brand.jsx';
import LangSwitcher from '../LangSwitcher.jsx';

export default function DocumentLayout({ title, eyebrow, intro, children }) {
 return <div className="atelier-document"><header className="atelier-document-nav"><Brand/><div><Link to="/"> Beranda</Link><LangSwitcher/></div></header><main><div className="atelier-document-hero"><span className="atelier-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p><Flower/><img src="/assets/landing-canvas/rosewalk.webp" alt="" aria-hidden="true"/></div><div className="atelier-document-body">{children}</div></main><footer className="atelier-document-footer"><Brand/><nav aria-label="Informasi"><Link to="/guide">Panduan</Link><Link to="/terms">Ketentuan</Link><Link to="/privacy">Privasi</Link></nav><small>© {new Date().getFullYear()} Samavaya</small></footer></div>;
}
