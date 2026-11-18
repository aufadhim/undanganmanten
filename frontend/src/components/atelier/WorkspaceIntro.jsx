import { Link } from 'react-router-dom';
import { Flower } from './Brand.jsx';

export default function WorkspaceIntro({ sandbox = false }) {
  return <div className="atelier-workspace-intro"><div><span className="atelier-eyebrow">{sandbox ? 'RUANG EKSPLORASI' : 'RUANG CERITA KALIAN'}</span><p>{sandbox ? <>Temukan warna<br/><em>cerita kalian.</em></> : <>Sedikit demi sedikit,<br/><em>menjadi milik kalian.</em></>}</p><span className="atelier-intro-note">{sandbox ? 'Pilih desain, lalu beri sentuhan personal.' : 'Rangkai setiap detail hari bahagia di sini.'}</span></div><Link className="atelier-intro-brand" to="/" aria-label="Kembali ke beranda"><Flower/></Link><img src="/assets/landing-canvas/garden.webp" alt="" aria-hidden="true"/></div>;
}
