import {useEffect,useRef,useState} from 'react';
import {api} from '../api/client.js';
import Button from './ui/Button.jsx';
import {useUI} from '../context/UIContext.jsx';
import {resolveImageUrl} from '../config/env.js';
import {livestreamTarget} from '../utils/livestream.js';
import './livestream-editor.css';
export default function LivestreamEditor({invitation,onUpdated,onLivePreview}){
 const settings=invitation.livestreamSettings||{};
 const [url,setUrl]=useState(settings.url||''),[cover,setCover]=useState(settings.coverImageUrl||''),[saving,setSaving]=useState(false),[uploading,setUploading]=useState(false);
 const input=useRef(null),{toast}=useUI();const target=livestreamTarget(url),invalid=Boolean(url.trim())&&!target;
 useEffect(()=>{setUrl(invitation.livestreamSettings?.url||'');setCover(invitation.livestreamSettings?.coverImageUrl||'')},[invitation.id]);
 const preview=(nextUrl,nextCover)=>onLivePreview?.({livestreamSettings:{...settings,url:nextUrl,coverImageUrl:nextCover}});
 const save=async()=>{if(invalid)return;setSaving(true);try{const {data}=await api.patch('/invitations/me/livestream-settings',{invitationId:invitation.id,url:url.trim(),coverImageUrl:cover});onUpdated?.({...invitation,livestreamSettings:data.livestreamSettings})}catch(e){toast.error(e.response?.data?.error||'Gagal menyimpan siaran')}finally{setSaving(false)}};
 const upload=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){toast.error('Pilih JPG, PNG, atau WebP maksimal 5 MB.');return}
 setUploading(true);try{const form=new FormData();form.append('file',file);form.append('invitationId',invitation.id);const {data}=await api.post('/themes/upload-asset',form);setCover(data.url);preview(url,data.url)}catch(e){toast.error(e.response?.data?.error||'Gagal mengunggah sampul')}finally{setUploading(false)}};
 return <div className="live-editor"><h2>Live Streaming</h2><p>Bagikan siaran untuk tamu yang hadir dari jauh.</p><label className="field-label" htmlFor="live-url">Tautan siaran</label><input id="live-url" className="text-input" type="url" value={url} placeholder="https://youtube.com/live/..." aria-invalid={invalid} aria-describedby="live-url-help" disabled={saving} onChange={e=>{setUrl(e.target.value);preview(e.target.value,cover)}}/><p id="live-url-help" className="live-editor-help">{invalid?'Gunakan tautan lengkap dengan https://.':'YouTube diputar di undangan. Zoom, Instagram, dan layanan lain dibuka di tab baru.'}</p><Button variant="secondary" disabled={!target} onClick={()=>window.open(target.url,'_blank','noopener,noreferrer')}>Coba tautan</Button>
 <section className="live-editor-cover"><h3>Sampul (opsional)</h3><div className="live-editor-poster">{cover||target?.thumbnail?<img src={cover?resolveImageUrl(cover):target.thumbnail} alt="Sampul siaran"/>:<span>Tanpa sampul</span>}</div><p className="live-editor-help">JPG, PNG, WebP maksimal 5 MB. Rasio 16:9.</p><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={upload}/><div className="live-editor-actions"><Button variant="secondary" disabled={saving} isLoading={uploading} onClick={()=>input.current?.click()}>{cover?'Ganti sampul':'Unggah sampul'}</Button>{cover&&<Button variant="secondary" disabled={saving||uploading} onClick={()=>{setCover('');preview(url,'')}}>Hapus sampul</Button>}</div></section><Button saveAction fullWidth disabled={invalid||uploading} isLoading={saving} onClick={save}>Simpan konten</Button></div>
}
