import {invitationStatus,invitationStatusLabel} from '../../utils/invitationStatus.js';
import {useState,useEffect,useRef} from 'react';
import {api} from '../../api/client.js';
import {useUI} from '../../context/UIContext.jsx';
import Brand from '../atelier/Brand.jsx';
import ThemeThumbnail from '../ThemeThumbnail.jsx';
import CreateInvitationModal from '../CreateInvitationModal.jsx';
import {THEME_CATALOG as THEMES} from '../../config/themeCatalog.js';
import './invitation-library.css';
const labels={draft:'Draft',published:'Terbit',expired:'Masa aktif berakhir',archived:'Diarsipkan',trashed:'Diarsipkan'};
const title=inv=>`${inv.coupleProfile?.brideName||'Mempelai wanita'} & ${inv.coupleProfile?.groomName||'Mempelai pria'}`;
export default function InvitationLibrary({invitations,onEdit,onRefresh,onCreated,onLogout,embedded=false,onManageGuests,onManageBilling,defaultWeddingId}){
 const {toast,confirm}=useUI();const [filter,setFilter]=useState('active'),[search,setSearch]=useState(''),[creating,setCreating]=useState(false),[busy,setBusy]=useState(null),[publication,setPublication]=useState(null);
 const [deleteTarget,setDeleteTarget]=useState(null),[deletePhrase,setDeletePhrase]=useState('');
 async function permanentlyDelete(){const inv=deleteTarget;if(deletePhrase!==inv.slug)return;setBusy(inv.id);try{const {data}=await api.delete(`/invitations/${inv.id}`,{data:{confirmSlug:deletePhrase}});toast.success(data.message);setDeleteTarget(null);setDeletePhrase('');onRefresh()}catch(e){toast.error(e.response?.data?.error||'Undangan belum berhasil dihapus.')}finally{setBusy(null)}}
 const actionDialog = useRef(null);
 const [actionTarget, setActionTarget] = useState(null);
 function openActions(inv) {
  setActionTarget(inv);
  actionDialog.current.showModal();
 }
 function runAction(action) {
  actionDialog.current.close();
  action();
 }
 const quotaReached=invitations.length>=3;
 const isLive=inv=>inv.status==='published'&&new Date(inv.expiresAt)>new Date();
 const displayStatus=inv=>invitationStatus(inv);
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get('publish');const inv=invitations.find(i=>i.id===id);if(inv)publicationDialog(inv)},[]);
 const group=inv=>['archived','trashed'].includes(inv.status)?'archive':'active';
 const list=invitations.filter(i=>group(i)===filter&&`${title(i)} ${i.slug}`.toLowerCase().includes(search.toLowerCase()));
 const link=inv=>`${window.location.origin}/${inv.slug}`;
 async function perform(inv,action){
  const prompts={archive:['Arsipkan undangan?',`“${title(inv)}” disimpan di Arsip. Tautan publik berhenti dapat diakses. Saat dipulihkan, statusnya menjadi draft.`],unpublish:['Tarik publikasi?',`Tamu tidak lagi dapat membuka tautan “${title(inv)}” sampai diterbitkan kembali.`],duplicate:['Buat salinan draft?','Desain dan konten disalin. Tamu, RSVP, ucapan, statistik, serta aktivasi paket tidak disalin.']};
  if(prompts[action]&&!await confirm(...prompts[action],{}))return;
  setBusy(inv.id);try{if(action==='duplicate')await api.post(`/invitations/${inv.id}/duplicate`);else await api.post(`/invitations/${inv.id}/lifecycle`,{action});toast.success(action==='restore'?'Undangan dipulihkan sebagai draft.':'Perubahan disimpan.');onRefresh();}catch(e){toast.error(e.response?.data?.error||'Perubahan belum dapat disimpan.')}finally{setBusy(null)}
 }
 async function publicationDialog(inv){setBusy(inv.id);try{const {data}=await api.get(`/invitations/${inv.id}/publication`);setPublication({inv,...data})}catch(e){toast.error(e.response?.data?.error||'Checklist belum dapat dimuat.')}finally{setBusy(null)}}
 async function publish(){const inv=publication.inv;if(!await confirm('Terbitkan undangan?',`Undangan “${title(inv)}” akan dapat diakses tamu melalui ${link(inv)}.`))return;setBusy(inv.id);try{await api.patch(`/invitations/${inv.id}`,{status:'published'});toast.success('Undangan berhasil diterbitkan. Tautan siap dibagikan.');setPublication(null);onRefresh()}catch(e){toast.error(e.response?.data?.error||'Publikasi belum berhasil.');if(e.response?.data?.checks)setPublication(p=>({...p,checks:e.response.data.checks,ready:false}))}finally{setBusy(null)}}

 async function copy(inv){try{await navigator.clipboard.writeText(link(inv));toast.success('Tautan undangan disalin.')}catch{toast.error('Tautan belum dapat disalin. Anda dapat menyalinnya dari alamat undangan.')}}
 return <div className="invitation-library">
  {!embedded&&<header className="library-header"><Brand/><button onClick={onLogout}>Keluar</button></header>}
  <main><section className="library-intro"><div><span className="library-eyebrow">RUANG CERITA KALIAN</span><h1>Undangan <em>saya.</em></h1><p>Kelola cerita kalian, dari draft pertama hingga kabar bahagia siap dibagikan.</p></div><button className="library-primary" disabled={quotaReached} onClick={()=>setCreating(true)}>Buat undangan</button></section>
  <p className="library-help">{invitations.length}/3 undangan</p><ol className="library-steps"><li><b>01</b> Buat & lengkapi</li><li><b>02</b> Pratinjau & aktifkan paket</li><li><b>03</b> Terbitkan & bagikan</li></ol>
  {quotaReached&&<p className="library-help">Batas 3 undangan per akun sudah tercapai. Arsip dan paket berbayar tetap dihitung. Hapus permanen undangan yang tidak dipakai untuk membuka slot.</p>}<div className="library-toolbar"><nav aria-label="Filter daftar undangan">{[['active','Undangan'],['archive','Arsip']].map(([key,label])=><button key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{label} <small>{invitations.filter(i=>group(i)===key).length}</small></button>)}</nav><input aria-label="Cari undangan" placeholder="Cari pasangan atau tautan…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
  {filter!=='active'&&<p className="library-help">Arsip menyimpan undangan yang tidak sedang digunakan dan tetap dihitung dalam batas 3 undangan serta kuota penyimpanan. Pemulihan mengembalikan undangan menjadi draft; periksa kembali sebelum menerbitkan.</p>}
  {!list.length?<section className="library-empty"><h2>{search?'Undangan tidak ditemukan':filter==='active'?'Mari mulai cerita kalian.':'Arsip masih kosong.'}</h2><p>{search?'Coba nama pasangan atau tautan lain.':'Undangan akan muncul di sini sesuai statusnya.'}</p>{filter==='active'&&!search&&<button className="library-primary" disabled={quotaReached} onClick={()=>setCreating(true)}>Buat undangan pertama</button>}</section>:<div className="library-grid">{list.map(inv=>{const theme=THEMES.find(t=>t.id===inv.themeId)||{id:inv.themeId,name:'Desain undangan',previewImg:'/templates/viridarium/assets/garden-entrance-watercolor-v3.webp'};const locked=busy===inv.id;return <article className="library-card" key={inv.id} aria-busy={locked}>
   <div className="library-art"><ThemeThumbnail theme={theme}/><span className={`library-status status-${displayStatus(inv)}`}>{invitationStatusLabel(inv)}</span></div>
   <div className="library-card-body">
    <span className="library-theme">{theme.name}</span>
    <div className="library-card-heading">
     <h2>{title(inv)}</h2>
     <button type="button" className="library-more-trigger" aria-label={`Aksi lainnya untuk ${title(inv)}`} aria-haspopup="dialog" disabled={locked} onClick={()=>openActions(inv)}>⋯</button>
    </div>
    <p className="library-date">{new Date(inv.weddingDate).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
    <p className="library-slug">/{inv.slug}</p>
    <div className="library-card-controls">
     {group(inv)==='active'?<>
      <button disabled={locked} className="library-primary" onClick={()=>onEdit(inv)}>Edit undangan</button>
      <div className="library-quick-actions">{isLive(inv)?<>
       <a href={link(inv)} target="_blank" rel="noreferrer"><i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"/> Lihat undangan</a>
       <button disabled={locked} onClick={()=>copy(inv)}><i className="fa-solid fa-link" aria-hidden="true"/> Salin tautan</button>
      </>:<>
       <button disabled={locked} onClick={()=>onEdit(inv,'preview')}><i className="fa-solid fa-eye" aria-hidden="true"/> Pratinjau</button>
       <button disabled={locked} onClick={()=>publicationDialog(inv)}><i className="fa-solid fa-paper-plane" aria-hidden="true"/> Siapkan publikasi</button>
      </>}</div>
     </>:<button disabled={locked} className="library-primary" onClick={()=>perform(inv,'restore')}>Pulihkan ke draft</button>}
    </div>
    <p className="library-card-meta">{inv.packageType==='TRIAL'?'Paket belum aktif':`Paket ${inv.packageType} · Aktif hingga ${new Date(inv.expiresAt).toLocaleDateString('id-ID')}`}</p>
</div></article>})}</div>}
  </main>
  <dialog ref={actionDialog} className="library-dialog library-more-dialog" aria-labelledby="library-more-title" onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close()}}>
   <div className="library-more-content">
    <header><h2 id="library-more-title">{actionTarget && title(actionTarget)}</h2><button type="button" autoFocus aria-label="Tutup aksi lainnya" onClick={()=>actionDialog.current.close()}>×</button></header>
    {actionTarget && <>
     {group(actionTarget)==='active'&&<>
      {isLive(actionTarget)&&<button onClick={()=>runAction(()=>onEdit(actionTarget,'preview'))}><i className="fa-solid fa-eye" aria-hidden="true"/><span>Pratinjau</span></button>}
      {onManageGuests&&<button onClick={()=>runAction(()=>onManageGuests(actionTarget))}><i className="fa-solid fa-users" aria-hidden="true"/><span>Kelola tamu</span></button>}
      <button disabled={quotaReached} onClick={()=>runAction(()=>perform(actionTarget,'duplicate'))}><i className="fa-solid fa-copy" aria-hidden="true"/><span>Duplikat</span></button>
      <button onClick={()=>runAction(()=>perform(actionTarget,'archive'))}><i className="fa-solid fa-box-archive" aria-hidden="true"/><span>Arsipkan</span></button>
     </>}
     <div className="library-more-danger">
      {isLive(actionTarget)&&<button className="library-danger" onClick={()=>runAction(()=>perform(actionTarget,'unpublish'))}><i className="fa-solid fa-eye-slash" aria-hidden="true"/><span>Tarik publikasi</span></button>}
      <button className="library-danger" onClick={()=>runAction(()=>{setDeleteTarget(actionTarget);setDeletePhrase('')})}><i className="fa-solid fa-trash-can" aria-hidden="true"/><span>Hapus permanen</span></button>
     </div>
    </>}
   </div>
  </dialog>
  {deleteTarget&&<div className="library-dialog-overlay"><section role="dialog" aria-modal="true" aria-labelledby="delete-invitation-heading" className="library-dialog"><h2 id="delete-invitation-heading">Hapus permanen?</h2><p>Desain undangan “{title(deleteTarget)}”, konten, ucapan, dan statistik akan dihapus. Daftar tamu dan RSVP tetap tersimpan di pernikahan. Tautan berhenti berfungsi dan data tidak bisa dipulihkan. Media yang masih dipakai undangan lain tetap disimpan.</p><label htmlFor="delete-confirm-slug">Ketik <strong>{deleteTarget.slug}</strong> untuk mengonfirmasi.</label><input id="delete-confirm-slug" autoComplete="off" value={deletePhrase} onChange={e=>setDeletePhrase(e.target.value)}/><div className="library-card-actions"><button disabled={!!busy} onClick={()=>setDeleteTarget(null)}>Batal</button><button className="library-danger" disabled={!!busy||deletePhrase!==deleteTarget.slug} onClick={permanentlyDelete}>Hapus permanen</button></div></section></div>}
  {creating&&<CreateInvitationModal isFirstInvitation={!invitations.length} selectedThemeId="garden-canvas" onClose={()=>setCreating(false)} onCreated={inv=>{setCreating(false);onCreated(inv)}}/>}
  {publication && (() => {
    const {inv, checks, ready} = publication;
    const packageCheck = checks.find(check => check.key === 'package');
    const requirements = checks.filter(check => !['package','gift','livestream'].includes(check.key) && (check.key !== 'expiry' || inv.packageType !== 'TRIAL'));
    const editable = checks.find(c => !c.ok && ['profile','events'].includes(c.key));
    const needsPackage = inv.packageType === 'TRIAL' || checks.some(c => c.key === 'expiry' && !c.ok);
    const edit = key => { setPublication(null); onEdit(inv,key); };
    return <div className="library-dialog-overlay" onClick={()=>setPublication(null)}>
      <section role="dialog" aria-modal="true" aria-labelledby="publication-heading" className="library-dialog" onClick={e=>e.stopPropagation()}>
        <button className="library-dialog-close" onClick={()=>setPublication(null)}>Tutup</button>
        <span className="library-eyebrow">SEBELUM DIBAGIKAN</span>
        <h2 id="publication-heading">Siapkan &amp; Terbitkan</h2>
        <p>{title(inv)}</p>
        <ul className="publication-checks">{requirements.map(c=><li key={c.key} className={c.ok?'complete':''}><span>{c.ok?'✓':'○'}</span>{c.label}</li>)}</ul>
        {packageCheck && <div className="publication-package">
          <strong>{packageCheck.ok ? 'Paket sudah aktif' : 'Aktifkan paket untuk menerbitkan'}</strong>
          {!packageCheck.ok && <span>Paket mulai Rp99.000. Setelah pembayaran terverifikasi, kamu bisa menerbitkan undangan dari sini.</span>}
        </div>}
        <p className="library-help">{ready?'Paket aktif. Terbitkan agar tautan bisa dibuka tamu.':editable?'Lengkapi bagian yang ditandai untuk melanjutkan.':needsPackage?null:'Periksa status undangan pada daftar di atas.'}</p>
        <div className="library-card-actions">
          {ready ? <button className="library-primary" disabled={!!busy} onClick={publish}>Terbitkan undangan</button>
            : editable ? <button className="library-primary" onClick={()=>edit(editable.key)}>Lengkapi undangan</button>
            : needsPackage && onManageBilling ? <button className="library-primary" onClick={()=>{setPublication(null);onManageBilling(inv)}}>Pilih paket &amp; bayar</button> : null}
        </div>
      </section>
    </div>;
  })()}
 </div>
}
