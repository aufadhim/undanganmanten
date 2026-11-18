import WeddingPlanner from './WeddingPlanner.jsx';
import LoadingScreen from '../atelier/LoadingScreen.jsx';
import QuickDraftForm from './QuickDraftForm.jsx';
import {WEDDING_MODULES} from '../../config/weddingModules.js';
import RetainedWeddingGuests from './RetainedWeddingGuests.jsx';
import {lazy,Suspense,useEffect,useState} from 'react';
import {useSearchParams,Link,Navigate} from 'react-router-dom';
import Brand from '../atelier/Brand.jsx';
import {DashboardThemeToggle} from '../atelier/CanvasRouteFrame.jsx';
import InvitationLibrary from './InvitationLibrary.jsx';
import AccountProfile from './AccountProfile.jsx';
import {api,setActiveInvitationId} from '../../api/client.js';
import './wedding-workspace.css';
const Guests=lazy(()=>import('../TamuPanel.jsx')),Analytics=lazy(()=>import('../AnalitikPanel.jsx')),Billing=lazy(()=>import('../BillingPanel.jsx')),Settings=lazy(()=>import('../PengaturanPanel.jsx')),Wishes=lazy(()=>import('../WishesPanel.jsx'));
const previewedInvitations = new Set();
const sections=[...WEDDING_MODULES.filter(m=>m.enabled).map(m=>[m.id,m.label]),['account','Profil Akun']];
const mobileSections = [
 ['overview', 'Ringkasan', 'rundown'],
 ['invitations', 'Undangan', 'rsvp'],
 ['guests', 'Tamu', 'wanita'],
];
const mobileMoreIcons = {
 planner: 'dashboard-planner',
 analytics: 'countdown',
 billing: 'gift',
 settings: 'dashboard-link',
 account: 'dashboard-profile',
};
const sidebarGroups = [
 {label:'Persiapan',items:[['overview','Ringkasan','rundown'],['planner','Wedding Planner','dashboard-planner'],['invitations','Undangan','rsvp']]},
 {label:'Kelola acara',items:[['guests','Tamu & RSVP','wanita'],['analytics','Analitik','countdown']]},
 {label:'Pengaturan',items:[['billing','Paket & Pembayaran','gift'],['settings','Pengaturan tautan','dashboard-link']]},
];
function MobileNavIcon({ symbol }) {
 return <span className="workspace-mobile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href={`/templates/shared/dock-watercolor.svg#${symbol}`} /></svg></span>;
}
const name=i=>`${i?.coupleProfile?.brideName||'Mempelai wanita'} & ${i?.coupleProfile?.groomName||'Mempelai pria'}`;
export default function WeddingWorkspace({invitations,onEdit,onUpdated,onRefresh,onCreated,onLogout,onPreviewGuest,onDeleted}){
 const [params,setParams]=useSearchParams();const section=sections.some(([s])=>s===params.get('section'))?params.get('section'):'overview';
 const [moreOpen, setMoreOpen] = useState(false);
 const mobilePrimary = mobileSections.some(([id]) => id === section);
 useEffect(() => {
  if (!moreOpen) return;
  const close = event => { if (event.key === 'Escape') setMoreOpen(false); };
  window.addEventListener('keydown', close);
  return () => window.removeEventListener('keydown', close);
 }, [moreOpen]);
 const [weddings,setWeddings]=useState([]); const [account,setAccount]=useState(null);const [accountError,setAccountError]=useState(false);const admin=account?.role==='ADMIN';
 const loadAccount=()=>{setAccountError(false);api.get('/auth/me').then(({data})=>setAccount(data.user)).catch(()=>setAccountError(true))};
 useEffect(()=>{loadAccount()},[]);
 useEffect(()=>{api.get('/weddings').then(({data})=>setWeddings(data.weddings||[])).catch(()=>{})},[invitations]);
 const allActive=invitations.filter(i=>!['archived','trashed'].includes(i.status));
 const requested=invitations.find(i=>i.id===params.get('invitation'));
 const wedding=weddings.find(w=>w.id===(params.get('wedding')||requested?.weddingId))||weddings[0];
 const available=allActive.filter(i=>!wedding||i.weddingId===wedding.id);
 const selected=available.find(i=>i.id===params.get('invitation'))||available[0];
 const go=(next,id=selected?.id)=>{const target=invitations.find(i=>i.id===id);setParams({section:next,...(id?{invitation:id}:{}),...(target?.weddingId||wedding?.id?{wedding:target?.weddingId||wedding.id}:{})})};
 useEffect(()=>{setActiveInvitationId(selected?.id||null)},[selected?.id,section]);

 const publication=inv=>setParams({section:'invitations',invitation:inv.id,publish:inv.id,wedding:inv.weddingId});
 const [quickDraftId,setQuickDraftId]=useState(null);
 const [guidance,setGuidance]=useState(null);
 useEffect(()=>{
  if(section!=='overview'||!selected||(selected.status==='published'&&new Date(selected.expiresAt)>new Date()))return;
  let active=true;
  Promise.all([
   api.get(`/invitations/${selected.id}/publication`).then(r=>r.data.checks).catch(()=>null),
   api.get('/payments/availability').then(r=>r.data.enabled).catch(()=>null),
  ]).then(([checks,payments])=>{if(active)setGuidance({invitation:selected,checks,payments})});
  return()=>{active=false};
 },[section,selected]);
 const current=guidance?.invitation===selected?guidance:null;
 const missing=current?.checks?.find(check=>!check.ok&&['profile','events','gift','livestream'].includes(check.key));
 const preview=()=>{previewedInvitations.add(selected.id);onEdit(selected,'preview')};
 let next={text:'Periksa kesiapan undangan sebelum membagikannya.',label:'Siapkan publikasi',action:()=>publication(selected)};
 if(selected?.suspendedAt) next={text:'Undangan sedang ditangguhkan. Cek statusnya di daftar undangan.',label:'Lihat undangan',action:()=>go('invitations')};
 else if(selected?.status==='published'&&new Date(selected.expiresAt)>new Date()) next={text:'Undangan sudah terbit. Kelola tautan pribadi dan pantau konfirmasi kehadiran tamu.',label:'Kelola tamu',action:()=>go('guests')};
 else if(missing) next={text:missing.label+'. Lengkapi bagian ini di studio.',label:({profile:'Lengkapi nama pasangan',events:'Lengkapi detail acara',gift:'Periksa informasi hadiah',livestream:'Periksa livestream'})[missing.key],action:()=>onEdit(selected,missing.key)};
 else if(current?.checks&&!previewedInvitations.has(selected?.id)&&selected?.packageType==='TRIAL') next={text:'Detail undangan sudah lengkap. Lihat hasilnya sebelum memilih paket.',label:'Pratinjau undangan',action:preview};
 else if(current?.checks&&(selected?.packageType==='TRIAL'||current.checks.some(c=>c.key==='expiry'&&!c.ok))) next={text:current.payments===false?'Pembayaran online belum tersedia. Kamu tetap bisa melihat pilihan paket dan melanjutkan edit draft.':'Lihat pilihan paket dan total biaya sebelum mengaktifkan undangan.',label:'Lihat pilihan paket',action:()=>go('billing')};
 if(section==='planner')return <Navigate replace to={'/planner'+(wedding?'?wedding='+wedding.id:'')} />;
 return <div className="wedding-workspace"><aside className="workspace-sidebar"><Brand/><div className="workspace-sidebar-intro"><span className="workspace-label">RUANG PERNIKAHAN</span><p>Siapkan kabar bahagia kalian.</p></div><nav aria-label="Navigasi pengelolaan pernikahan">{sidebarGroups.map(group=><div className="workspace-nav-group" key={group.label}><p>{group.label}</p>{group.items.filter(([id])=>sections.some(([key])=>key===id)).map(([id,label,symbol])=><button type="button" key={id} aria-current={section===id?'page':undefined} onClick={()=>go(id)}><MobileNavIcon symbol={symbol}/><span>{label}</span></button>)}</div>)}</nav><div className="workspace-sidebar-bottom"><button type="button" className="workspace-account-link" aria-current={section==='account'?'page':undefined} onClick={()=>go('account')}><MobileNavIcon symbol="dashboard-profile"/><span className="workspace-account-identity"><strong>Profil Akun</strong><small title={account?.email}>{account?.email||'Lihat akun yang masuk'}</small></span></button>{admin&&<Link to="/admin"><MobileNavIcon symbol="cover"/><span>Panel Admin</span></Link>}<Link to="/guide"><MobileNavIcon symbol="janji"/><span>Panduan</span></Link><button type="button" className="workspace-logout" onClick={onLogout}><MobileNavIcon symbol="dashboard-logout"/><span>Keluar</span></button></div></aside>
 <div className="workspace-main"><header className="workspace-topbar"><div><span className="workspace-label">DASHBOARD PERNIKAHAN</span><strong>{(selected?.coupleProfile?.brideName && selected?.coupleProfile?.groomName ? name(selected) : wedding?.title || selected?.wedding?.title || 'Pernikahan kalian')}</strong></div><DashboardThemeToggle/>{weddings.length>1&&<label>Pernikahan<select aria-label="Pilih pernikahan" value={wedding?.id||''} onChange={e=>{const first=allActive.find(i=>i.weddingId===e.target.value);setParams({section,wedding:e.target.value,...(first?{invitation:first.id}:{})})}}>{weddings.map(w=><option value={w.id} key={w.id}>{w.title}</option>)}</select></label>}{section!=='account'&&available.length>0&&<label>Undangan<select aria-label="Pilih undangan untuk dikelola" value={selected?.id||''} onChange={e=>go(section,e.target.value)}>{available.map(inv=><option key={inv.id} value={inv.id}>{name(inv)} · /{inv.slug}</option>)}</select></label>}</header>
 {section==='invitations'?<InvitationLibrary defaultWeddingId={wedding?.id} embedded invitations={invitations} onEdit={onEdit} onRefresh={onRefresh} onCreated={onCreated} onLogout={onLogout} onManageGuests={inv=>go('guests',inv.id)} onManageBilling={inv=>go('billing',inv.id)}/>:<main className="workspace-page" data-section={section}><span className="workspace-label">{section==='account'?'AKUN SAYA':section==='overview'?'SELANGKAH MENUJU HARI BAHAGIA':'KELOLA PERNIKAHAN'}</span><div className="workspace-page-heading"><h1>{sections.find(([s])=>s===section)?.[1]}</h1>{section==='account'&&<button type="button" className="workspace-mobile-logout" onClick={onLogout} aria-label="Keluar dari akun" title="Keluar dari akun"><i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /></button>}</div>
 {section==='overview'?<><p className="workspace-subtitle">Desain undangan di studio. Kelola tamu, publikasi, dan pembayaran langsung dari dashboard ini.</p><div className="workspace-stats"><div><small>Undangan tersimpan</small><strong>{invitations.length}<em> / 3</em></strong></div><div><small>Sudah terbit</small><strong>{invitations.filter(i=>i.status==='published').length}</strong></div><div><small>Tamu pernikahan ini</small><strong>{selected?.guests?.length||wedding?._count?.guests||0}</strong></div></div>{selected?<section className="workspace-next"><span className="workspace-label">LANGKAH BERIKUTNYA</span><h2>{name(selected)}</h2><p>{next.text}</p><div className="workspace-actions"><button className="workspace-primary" onClick={next.action}>{next.label}</button>{selected.status==='draft'&&selected.packageType==='TRIAL'&&!selected.suspendedAt&&quickDraftId!==selected.id&&<button className="workspace-quick-trigger" onClick={()=>setQuickDraftId(selected.id)}>Edit cepat</button>}</div>{quickDraftId===selected.id&&<QuickDraftForm key={selected.id} invitation={selected} onCancel={()=>setQuickDraftId(null)} onSaved={updated=>{onUpdated(updated);setQuickDraftId(null);previewedInvitations.add(updated.id);onEdit(updated,'preview')}}/>}</section>:<section className="workspace-next"><h2>Mari mulai cerita kalian.</h2><p>Buat undangan pertama untuk menyiapkan halaman pernikahan dan daftar tamu.</p><button onClick={()=>go('invitations')}>Buat undangan pertama</button></section>}<section className="workspace-help"><h2>Mulai dari detail yang paling penting.</h2><p>Lengkapi nama pasangan, tanggal, dan lokasi acara. Periksa pratinjau sebelum aktivasi dan publikasi, lalu bagikan tautan pribadi kepada tamu.</p><Link className="sam-action-link" to="/guide">Baca panduan</Link></section></>:
 section==='account'?<section className="workspace-account-card">{account?<AccountProfile account={account} onUpdated={setAccount} onLogout={onLogout}/>:accountError?<><p role="alert">Data akun belum bisa dimuat.</p><button onClick={loadAccount}>Coba lagi</button></>:<LoadingScreen compact label="Memuat profil akun…" />}</section>:
 section==='planner'?(wedding?<WeddingPlanner key={wedding.id} wedding={wedding} onShortcut={selected ? preset => {
  if (preset === 'details') onEdit(selected, 'events');
  else if (preset === 'preview') publication(selected);
  else go('guests');
 } : undefined}/>:<p>Buat undangan untuk mulai menyusun checklist pernikahan.</p>):
 !selected?(section==='guests'&&wedding?<RetainedWeddingGuests wedding={wedding}/>:<section className="workspace-next"><p>Buat atau pulihkan undangan untuk menggunakan bagian ini.</p><button onClick={()=>go('invitations')}>Undangan Saya</button></section>):<div className="workspace-panel" key={`${section}-${selected.id}`}><Suspense fallback={<LoadingScreen compact label="Memuat halaman…" />}>
 {section==='guests'&&<><p className="workspace-subtitle">Kelola tamu di halaman penuh. Tautan pribadi menggunakan undangan yang dipilih di atas.</p><Guests fullPage autoPreview={false} invitation={selected} onUpdated={onUpdated} onSelectPreviewGuest={guest=>onPreviewGuest(selected,guest)}/></>}
 {section==='analytics'&&<><p className="workspace-subtitle">Kunjungan dihitung untuk undangan terpilih. Data tamu dan RSVP digunakan bersama dalam satu pernikahan.</p><Analytics invitation={selected}/></>}
 {section==='billing'&&<Billing invitation={selected} onUpdated={onUpdated} onManagePublication={()=>publication(selected)}/>}
 {section==='settings'&&<Settings invitation={selected} onUpdated={onUpdated} onDeleted={onDeleted}/>}
 </Suspense></div>}
 </main>}
 </div>
 <div className="workspace-mobile-navigation">
  {moreOpen && <button type="button" className="workspace-mobile-scrim" aria-label="Tutup menu lainnya" onClick={() => setMoreOpen(false)} />}
  <nav aria-label="Navigasi dashboard">
   {mobileSections.map(([id, label, icon]) => (
    <button key={id} type="button" aria-current={section === id ? 'page' : undefined} onClick={() => { setMoreOpen(false); go(id); }}>
     <MobileNavIcon symbol={icon} />{label}
    </button>
   ))}
   <button type="button" aria-expanded={moreOpen} aria-controls="workspace-mobile-more" data-selected={!mobilePrimary} onClick={() => setMoreOpen(!moreOpen)}>
    <MobileNavIcon symbol="hero" />Lainnya
   </button>
  </nav>
  <div id="workspace-mobile-more" className="workspace-mobile-more" hidden={!moreOpen}>
   <h2>Lainnya</h2>
   {sections.filter(([id]) => !mobileSections.some(([primary]) => primary === id)).map(([id, label]) => (
    <button key={id} type="button" aria-current={section === id ? 'page' : undefined} onClick={() => { setMoreOpen(false); go(id); }}><MobileNavIcon symbol={mobileMoreIcons[id] || "hero"} /><span>{label}</span><span className="workspace-mobile-chevron" aria-hidden="true" /></button>
   ))}
   {admin && <Link to="/admin"><MobileNavIcon symbol="cover" /><span>Panel Admin</span><span className="workspace-mobile-chevron" aria-hidden="true" /></Link>}
   <Link to="/guide"><MobileNavIcon symbol="janji" /><span>Panduan</span><span className="workspace-mobile-chevron" aria-hidden="true" /></Link>
  </div>
 </div></div>
}

