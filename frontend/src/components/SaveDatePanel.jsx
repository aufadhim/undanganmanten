import {useEffect,useState} from 'react';
import {useFormDraft} from '../hooks/useFormDraft.js';
import {api} from '../api/client.js';
import {useUI} from '../context/UIContext.jsx';
import Button from './ui/Button.jsx';
export default function SaveDatePanel({invitation,onUpdated,onLivePreview}){
 const events=invitation.events||[],event=events.find(e=>['akad','CEREMONY'].includes(e.type))||events[0]||{type:'akad'};
 const [form,setForm,clearDraft]=useFormDraft(`draft_save_date_${invitation.id}`,{date:String(event.date||invitation.weddingDate||'').slice(0,10),startTime:event.startTime||'08:00'}),[saving,setSaving]=useState(false);const {toast}=useUI();
 const replace=next=>events.length?events.map(e=>e===event?next:e):[next];
 useEffect(()=>{onLivePreview?.({events:replace({...event,...form})})},[form,onLivePreview]);
 async function save(){setSaving(true);try{const {data}=await api.post('/invitations/me/events',{...event,...form},{notification:false});onUpdated({...invitation,events:replace(data.event)});clearDraft();toast.success('Tanggal tersimpan.')}catch(e){toast.error(e.response?.data?.error||'Tanggal belum tersimpan.')}finally{setSaving(false)}}
 return <div className="panel-content"><h2 className="panel-header">Simpan Tanggal</h2><p className="panel-sub">Tanggal dan waktu acuan countdown serta kalender. Terhubung dengan acara utama.</p><div className="stack"><label className="field-label">Tanggal<input className="text-input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label className="field-label">Waktu mulai<input className="text-input" type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/></label></div><Button saveAction fullWidth disabled={!form.date||!form.startTime} onClick={save} isLoading={saving}>Simpan tanggal</Button></div>
}
