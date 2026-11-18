import { useTranslation } from 'react-i18next';
import { Flower } from './Brand.jsx';

export default function AuthArtwork() {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  return <aside className="auth-right atelier-auth-art" aria-label={en ? 'A watercolor garden' : 'Taman dalam lukisan cat air'}>
    <div className="atelier-auth-painting" aria-hidden="true">
      <img className="atelier-art-garden" src="/assets/landing-canvas/garden.webp" alt=""/>
      <img className="atelier-art-couple" src="/assets/landing-canvas/couple.webp" alt=""/>
      <img className="atelier-art-leaves" src="/assets/landing-canvas/foliage.webp" alt=""/>
    </div>
    <div className="atelier-art-heading"><span>{en ? 'A LITTLE GARDEN OF PROMISES' : 'SEBUAH TAMAN PENUH JANJI'}</span><h2>{en ? <>Every story,<br/><em>beautifully yours.</em></> : <>Setiap kisah,<br/><em>indah dengan caranya.</em></>}</h2></div>
    <div className="atelier-art-caption"><Flower/><p>{en ? 'A place for your love story to bloom.' : 'Ruang kecil untuk kisah cinta yang terus tumbuh.'}</p><span>SAMAVAYA · EST. WITH LOVE</span></div>
  </aside>;
}
