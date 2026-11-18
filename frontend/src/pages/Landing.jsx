import { QRCodeSVG } from 'qrcode.react';
import { DashboardThemeToggle } from '../components/atelier/CanvasRouteFrame.jsx';
import { Flower } from '../components/atelier/Brand.jsx';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken } from '../api/client.js';
import PaintedGarden from '../components/landing/PaintedGarden.jsx';
import TemplateHeroPreview from '../components/landing/TemplateHeroPreview.jsx';
import { landingContent } from '../components/landing/landingContent.js';
import '../components/landing/canvas-landing.css';
import {getTemplate} from '../config/templateRegistry.js';

const ART='/assets/landing-canvas/';

function Title({lines}){return <>{lines.map((line,i)=><span key={line}>{i===lines.length-1?<em>{line}</em>:line}</span>)}</>}
export default function Landing(){
 const {i18n}=useTranslation(),english=i18n.language.startsWith('en'),copy=landingContent[english?'en':'id'],[menu,setMenu]=useState(false),[faq,setFaq]=useState(0),[selected,setSelected]=useState(0),page=useRef(null),loggedIn=!!getToken();
 useEffect(()=>{const node=page.current;document.title='Samavaya — '+(english?'Digital Wedding Invitations':'Undangan Pernikahan Digital');document.documentElement.lang=english?'en':'id';
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-seen');observer.unobserve(entry.target)}},{threshold:.08});node.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));return()=>observer.disconnect();
 },[english]);
 useEffect(()=>{if(!menu)return;function close(e){if(e.key==='Escape')setMenu(false)}document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[menu]);
 const featured=['garden-canvas','pramaya','ludora'].map(getTemplate);
 const collections=featured.map((t,i)=>[String(i+1).padStart(2,'0'),t.name,english?['Botanical · A painted garden','Nusantara · A story inside a book','Playful · A cheerful landscape'][i]:['Botanical · Taman dalam lukisan','Nusantara · Cerita di dalam buku','Playful · Perjalanan penuh keceriaan'][i],t.previewImg]);
 const navItems = [...copy.nav.map((label, i) => [label, ['pengalaman', 'koleksi', 'cara-kerja', 'harga'][i]]), [english ? 'QR Guest Book' : 'Buku Tamu QR', 'buku-tamu-qr']];
 const guestBook = english ? { title: 'Check guests in with a QR code', intro: 'Share a personal invitation link with each guest. At the venue, reception staff can scan the QR code or find the guest by name.', steps: ['Guests show their personal QR code', 'Staff record how many people arrive', 'Download attendance as Excel or PDF'], action: 'See how it works', sample: 'Example guest pass', guest: 'Nadira & Bagas', status: 'Check-in recorded', price: 'Optional add-on · Rp20,000' } : { title: 'Sambut tamu dengan check-in QR', intro: 'Bagikan tautan undangan pribadi ke setiap tamu. Di lokasi acara, petugas meja bisa memindai QR atau mencari nama tamu.', steps: ['Tamu menunjukkan QR pribadinya', 'Petugas mencatat jumlah orang yang hadir', 'Unduh rekap Excel atau laporan PDF'], action: 'Lihat cara kerjanya', sample: 'Contoh kartu tamu', guest: 'Nadira & Bagas', status: 'Kehadiran tercatat', price: 'Tambahan opsional · Rp20.000' };
 return <div ref={page} className="canvas-landing" id="atas">
  <a className="cl-skip" href="#konten">{english?'Skip to content':'Langsung ke konten'}</a>
  <header className="cl-header"><Link to="/" className="cl-brand" aria-label="Samavaya"><Flower/><span>samavaya<i>SEBUAH KABAR BAHAGIA</i></span></Link>
   <nav className="cl-nav" aria-label={english?'Main navigation':'Navigasi utama'}>{navItems.map(([label, anchor])=><a key={anchor} href={'#'+anchor}>{label}</a>)}</nav>
   <div className="cl-header-actions"><DashboardThemeToggle className="cl-theme-toggle" english={english}/><button className="cl-language" type="button" onClick={()=>i18n.changeLanguage(english?'id':'en')} aria-label={english?'Ganti bahasa ke Indonesia':'Switch to English'}>{english?'EN':'ID'}<span>⌄</span></button><Link className="cl-login" to={loggedIn?'/dashboard':'/login'}>{loggedIn?copy.dashboard:copy.login}</Link><Link className="cl-button cl-small" to={loggedIn?'/dashboard':'/signup'}>{copy.start}</Link><button className="cl-menu-toggle" type="button" aria-controls="cl-mobile-nav" aria-expanded={menu} aria-label={menu?copy.closeMenu:copy.menu} onClick={()=>setMenu(!menu)}>{menu?'×':'☰'}</button></div>
   {menu&&<nav className="cl-mobile-nav" id="cl-mobile-nav" aria-label={english?'Mobile navigation':'Navigasi seluler'}>{navItems.map(([label, anchor])=><a key={anchor} href={'#'+anchor} onClick={()=>setMenu(false)}>{label}</a>)}<Link to={loggedIn?'/dashboard':'/login'} onClick={()=>setMenu(false)}>{loggedIn?copy.dashboard:copy.login}</Link>{!loggedIn&&<Link to='/signup' onClick={()=>setMenu(false)}>{copy.start}</Link>}</nav>}
  </header>
  <main id="konten">
   <section className="cl-hero" aria-labelledby="cl-hero-title"><div className="cl-hero-copy"><p className="cl-kicker"><span/> {copy.eyebrow}</p><h1 id="cl-hero-title"><Title lines={copy.headline}/></h1><p className="cl-intro">{copy.intro}</p><div className="cl-hero-actions"><Link to="/sandbox" className="cl-button">{copy.try}</Link><a href="#pengalaman" className="cl-text-link sam-action-link">{copy.explore}</a></div><p className="cl-note">{copy.note}</p></div><div className="cl-hero-art"><PaintedGarden english={english}/></div><div className="cl-hero-bottom"><Flower/><span>{copy.scroll}</span><a href="#pengalaman" aria-label={copy.explore}>{copy.explore}</a></div></section>
   <section className="cl-promise cl-section" id="pengalaman" aria-labelledby="cl-promise-title"><div className="cl-promise-heading" data-reveal><p className="cl-kicker">{copy.promiseKicker}</p><h2 id="cl-promise-title"><Title lines={copy.promiseTitle}/></h2></div><div className="cl-promise-copy" data-reveal><p>{copy.promiseBody}</p><div className="cl-promise-list">{copy.promiseItems.map(([n,title,desc])=><article key={n}><span>{n}</span><div><h3>{title}</h3><p>{desc}</p></div></article>)}</div></div><Flower className="cl-promise-flower"/></section>
   <section className="cl-collection cl-section" id="koleksi" aria-labelledby="cl-collection-title"><div className="cl-section-head" data-reveal><div><p className="cl-kicker">{copy.collectionKicker}</p><h2 id="cl-collection-title"><Title lines={copy.collectionTitle}/></h2></div><div><p>{copy.collectionBody}</p><Link to="/sandbox" className="cl-text-link sam-action-link">{copy.collectionLink}</Link></div></div><div className="cl-studies" aria-label={copy.studies}>{collections.map(([num,title,palette,file],i)=><button className={`cl-study ${i===selected?'is-selected':''}`} type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)} key={file}><div className="cl-study-art"><TemplateHeroPreview theme={featured[i]}/><span>{num}</span></div><div className="cl-study-caption"><h3>{title}</h3><p>{palette}</p><span className="cl-study-selection" aria-hidden="true"/></div></button>)}</div><p className="cl-study-note">{copy.studies}</p><div className="cl-palette" aria-live="polite"><span>{collections[selected][1]}</span><Link className="cl-text-link sam-action-link" to={'/sandbox?theme='+featured[selected].id}>{english?'Try this design':'Coba desain ini'}</Link><span>{collections[selected][2]}</span></div></section>
   <section className="cl-features cl-section" id="fitur" aria-labelledby="cl-features-title"><div className="cl-feature-heading" data-reveal><Flower/><p className="cl-kicker">{copy.featureKicker}</p><h2 id="cl-features-title"><Title lines={copy.featureTitle}/></h2><p>{copy.featureBody}</p></div><div className="cl-feature-list">{copy.features.map(([icon,title,body])=><article key={title} data-reveal><span className="cl-feature-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
   <section className="cl-guestbook cl-section" id="buku-tamu-qr" aria-labelledby="cl-guestbook-title">
    <div className="cl-guestbook-copy">
     <p className="cl-kicker">{guestBook.price}</p>
     <h2 id="cl-guestbook-title">{guestBook.title}</h2>
     <p>{guestBook.intro}</p>
     <ol>{guestBook.steps.map(step => <li key={step}>{step}</li>)}</ol>
     <a className="cl-button" href="/undangan/buku-tamu-qr">{guestBook.action}</a>
    </div>
    <div className="cl-guestbook-art">
     <div className="cl-guestbook-pass">
      <Flower aria-hidden="true" />
      <p>{guestBook.sample}</p><strong>{guestBook.guest}</strong>
      <QRCodeSVG value="Samavaya — contoh kartu tamu" size={104} title={guestBook.sample} />
      <span><span aria-hidden="true">✓</span> {guestBook.status}</span>
     </div>
    </div>
   </section>
   <section className="cl-steps cl-section" id="cara-kerja" aria-labelledby="cl-steps-title"><div data-reveal><p className="cl-kicker">{copy.stepsKicker}</p><h2 id="cl-steps-title">{copy.stepsTitle}</h2></div><ol>{copy.steps.map(([title,body],i)=><li key={title} data-reveal><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>
   <section className="cl-pricing cl-section" id="harga" aria-labelledby="cl-price-title"><div className="cl-price-copy" data-reveal><p className="cl-kicker">{copy.priceKicker}</p><h2 id="cl-price-title"><Title lines={copy.priceTitle}/></h2><p>{copy.priceBody}</p><Link to="/sandbox" className="cl-button">{copy.priceAction}</Link><p className="cl-price-addon">{copy.addon}</p></div><div className="cl-price-options" data-reveal>{[{name:copy.standard,desc:copy.standardDesc,amount:'99.000',features:copy.standardFeatures},{name:copy.premium,desc:copy.premiumDesc,amount:'129.000',features:copy.premiumFeatures}].map((plan,i)=><article className={i?'is-premium':''} key={i}><div className="cl-plan-heading"><Flower/><h3>{plan.name}</h3></div><p>{plan.desc}</p><strong><small>Rp</small>{plan.amount}</strong><ul>{plan.features.map(f=><li key={f}><span aria-hidden="true">✓</span>{f}</li>)}</ul><Link to="/sandbox" aria-label={(english?'Try ':'Coba ')+plan.name}>{english?'Explore':'Jelajahi'}</Link></article>)}</div></section>
   <section className="cl-faq cl-section" aria-labelledby="cl-faq-title"><div data-reveal><p className="cl-kicker">{copy.faqKicker}</p><h2 id="cl-faq-title">{copy.faqTitle}</h2></div><div className="cl-faq-list">{copy.faqs.map(([question,answer],i)=><article key={i} className={faq===i?'is-open':''}><h3><button type="button" id={'cl-question-'+i} aria-expanded={faq===i} aria-controls={'cl-answer-'+i} onClick={()=>setFaq(faq===i?-1:i)}><span className="cl-faq-number">0{i+1}</span>{question}<span className="cl-faq-plus" aria-hidden="true">{faq===i?'−':'+'}</span></button></h3><div id={'cl-answer-'+i} aria-labelledby={'cl-question-'+i} hidden={faq!==i}><p>{answer}</p></div></article>)}</div></section>
   <section className="cl-closing"><img src={ART+'foliage.webp'} alt="" loading="lazy" decoding="async"/><div data-reveal><Flower/><p className="cl-kicker">{copy.closingKicker}</p><h2><Title lines={copy.closingTitle}/></h2><p>{copy.closingBody}</p><Link to={loggedIn?'/dashboard':'/signup'} className="cl-button">{copy.closingAction}</Link></div></section>
  </main>
  <footer className="cl-footer"><div className="cl-footer-top"><div><Link to="/" className="cl-brand"><Flower/><span>samavaya</span></Link><p>{copy.footerDesc}</p></div><div><h3>{copy.footerProduct}</h3><Link to="/sandbox">{copy.footerLinks[0]}</Link><a href="/undangan/harga">{copy.footerLinks[1]}</a><a href="/undangan/contoh">{copy.top==='Back to top'?'Invitation examples':'Contoh undangan'}</a><a href="/undangan/buku-tamu-qr">{copy.top==='Back to top'?'QR guest book':'Buku Tamu QR'}</a></div><div><h3>{copy.footerHelp}</h3><Link to="/guide">{copy.footerLinks[2]}</Link><Link to="/terms">{copy.footerLinks[3]}</Link><Link to="/privacy">{copy.footerLinks[4]}</Link><Link to="/contact">{copy.top==='Back to top'?'Contact':'Kontak'}</Link></div></div><div className="cl-footer-bottom"><span>© {new Date().getFullYear()} Samavaya</span><span>{copy.copyright}</span><a href="#atas">{copy.top} </a></div></footer>
 </div>
}
