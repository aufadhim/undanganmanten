import { DEFAULT_INVITATION_MUSIC, verifyPlayableAudio } from '../utils/invitationMusic.js';
import {isImmersiveTemplate} from '../config/templateRegistry.js';
import './mental-canvas-media.css';
import {useState,useRef} from 'react';
import {api} from '../api/client.js';
import {useUI} from '../context/UIContext.jsx';
import {resolveImageUrl} from '../config/env.js';
export const isMentalCanvas=id=>isImmersiveTemplate(id);
function MediaUpload({id,accept,busy,onChange,label}){
 const input=useRef(null);
 return <div className="canvas-media-upload"><input ref={input} id={id} type="file" accept={accept} disabled={busy} onChange={onChange} hidden/><button type="button" className="canvas-upload-button" disabled={busy} onClick={()=>input.current?.click()}>{busy?'Memproses…':label}</button></div>;
}
export default function MentalCanvasMediaPanel({invitation,onUpdated,mode='music'}){
 const [busy,setBusy]=useState(false);const [audioError,setAudioError]=useState('');const {toast}=useUI();const settings=invitation.themeSettings||{},enabled=invitation.invitationFeatures?.musicEnabled!==false;
 async function save(field,value){const {data}=await api.patch('/themes/me',{invitationId:invitation.id,[field]:value},{headers:{'x-invitation-id':invitation.id},notification:false});onUpdated({...invitation,themeSettings:{...settings,...data.themeSettings,[field]:data.themeSettings[field]}})}
 async function upload(e,field) {
  const input=e.target;
  const file=input.files?.[0];
  if(!file)return;
  const audio=field==='musicUrl';
  if(!(audio?file.type.startsWith('audio/')||(!file.type&&/\.mp3$/i.test(file.name)):file.type.startsWith('image/'))||file.size>(audio?8:5)*1048576){
   toast.error(audio?'Pilih MP3 maksimal 8 MB.':'Pilih gambar maksimal 5 MB.');
   input.value='';
   return;
  }
  setBusy(true);
  setAudioError('');
  try {
   const body=new FormData();
   body.append('file',audio&&!file.type?new Blob([file],{type:'audio/mpeg'}):file,file.name);
   const {data}=await api.post('/themes/upload-asset',body,{
    headers:{'x-invitation-id':invitation.id},
    notification:audio?false:undefined,
   });
   if(audio)await verifyPlayableAudio(resolveImageUrl(data.url));
   await save(field,data.url);
   toast.success(audio?'Musik siap diputar.':'Tersimpan.');
  } catch(err) {
   toast.error(err.response?.data?.error||err.message||'Unggahan belum tersimpan.');
  } finally {
   setBusy(false);
   input.value='';
  }
 }
 async function reset(field){setBusy(true);try{await save(field,'');toast.success('Kembali ke bawaan template.')}catch(err){toast.error(err.response?.data?.error||'Perubahan belum tersimpan.')}finally{setBusy(false)}}
 async function toggle(){setBusy(true);try{const {data}=await api.patch('/invitations/me/features',{invitationId:invitation.id,musicEnabled:!enabled});onUpdated({...invitation,invitationFeatures:data.features})}catch(err){toast.error(err.response?.data?.error||'Musik belum dapat diubah.')}finally{setBusy(false)}}
 if(mode==='couple')return <section className="section-block"><h3 className="section-title">Ilustrasi pasangan</h3><p className="panel-sub">Gambar pasangan yang menyatu dengan lukisan. Gunakan PNG atau WebP transparan agar latarnya tidak menutupi taman.</p>{[['coverImageUrl','Pasangan untuk Sampul & Hero']].map(([field,label])=><div className="field-group" key={field} style={{marginBottom:22}}><label htmlFor={field}>{label}</label><MediaUpload id={field} accept="image/*" busy={busy} onChange={e=>upload(e,field)} label="Pilih ilustrasi"/>{settings[field]&&<><img src={resolveImageUrl(settings[field])} alt={label} style={{display:'block',maxHeight:180,maxWidth:'100%',objectFit:'contain',margin:'12px 0'}}/><button type="button" className="btn btn-ghost" disabled={busy} onClick={()=>reset(field)}>Pakai ilustrasi bawaan</button></>}<small>Maksimal 5 MB. {settings[field]?'Gambar kustom digunakan.':'Menggunakan ilustrasi bawaan template.'}</small></div>)}</section>;
 return <><h2 className="panel-header">Musik</h2><p className="panel-sub">Pilih musik latar untuk menemani tamu menjelajahi undangan.</p><section className="section-block"><div className="canvas-music-setting"><div><strong>Musik latar</strong><small>{enabled?'Aktif — tamu dapat menjeda musik.':'Nonaktif — undangan tanpa musik.'}</small></div><button type="button" className="canvas-music-switch" role="switch" aria-label="Musik latar" aria-checked={enabled} disabled={busy} onClick={toggle}><span/></button></div>{enabled&&<div className="stack" style={{marginTop:20}}><MediaUpload id="canvas-music-upload" accept="audio/*" busy={busy} onChange={e=>upload(e,'musicUrl')} label={settings.musicUrl?'Ganti lagu':'Pilih lagu'}/><small>Gunakan MP3 maksimal 8 MB. Lagu disimpan setelah bisa dimuat.</small>{audioError&&audioError===settings.musicUrl&&<p role="alert">Lagu ini belum bisa diputar. Pilih file lain atau pakai musik bawaan.</p>}{settings.musicUrl?<><audio controls preload="metadata" key={settings.musicUrl} onError={()=>setAudioError(settings.musicUrl)} src={resolveImageUrl(settings.musicUrl)} style={{width:'100%'}}/><button type="button" className="btn btn-ghost" disabled={busy} onClick={()=>reset('musicUrl')}>Pakai musik bawaan</button></>:<><p>Menggunakan musik bawaan template.</p><audio controls preload="metadata" src={DEFAULT_INVITATION_MUSIC} style={{width:'100%'}}/></>}</div>}</section><p className="panel-sub">Musik mulai setelah tamu membuka undangan, dan dijeda saat tamu berpindah tab atau aplikasi.</p></>;
}
