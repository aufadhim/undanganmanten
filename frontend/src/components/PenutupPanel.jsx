import {isImmersiveTemplate,getTemplate} from '../config/templateRegistry.js';
import './closing-panel.css';
import { useEffect, useState } from 'react';
import Button from './ui/Button.jsx';
import { api } from '../api/client.js';
import { useUI } from '../context/UIContext.jsx';

export default function PenutupPanel({ invitation, onUpdated, onLivePreview, sandbox=false }) {
  const [closingText, setClosingText] = useState(invitation?.themeSettings?.closingText || '');
  const closingDefaults={scale:getTemplate(invitation?.themeId)?.closingDefaultScale??.72,x:0,y:0};
  const character=invitation?.themeSettings?.characterSettings;
  const [closing,setClosing]=useState(character?.closing||closingDefaults);
  const settings=()=>({...invitation.themeSettings,closingText,characterSettings:{mode:invitation.themeSettings?.coverImageUrl?'custom':'default',separatePose:Boolean(invitation.themeSettings?.coverSecondImageUrl),cover:{scale:1,x:0,y:0},hero:{scale:1,x:0,y:0},...character,closing}});
  const [saving, setSaving] = useState(false);
  const { toast } = useUI();

  useEffect(() => {setClosingText(invitation?.themeSettings?.closingText||'');setClosing(invitation?.themeSettings?.characterSettings?.closing||closingDefaults)},[invitation?.id,invitation?.themeId]);
  useEffect(() => onLivePreview?.({themeSettings:settings()}),[closingText,closing]);

  async function save() {
    setSaving(true);
    try {
      if(sandbox){onUpdated({...invitation,themeSettings:settings()});toast.success('Penutup tersimpan di perangkat ini.');return}
      const { data } = await api.patch('/themes/me', {invitationId:invitation.id,closingText,characterSettings:settings().characterSettings});
      onUpdated({ ...invitation, themeSettings: data.themeSettings });
      toast.success('Teks penutup berhasil disimpan.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan teks penutup.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="panel-content">
    <h2 className="panel-header">Penutup</h2>
    <p className="panel-sub">Kalimat terakhir undangan. Perubahan tampil langsung pada preview.</p>
    <div className="section-block stack">
      <label className="field">
        <span className="field-label">Teks Penutup</span>
        <textarea rows="5" maxLength="1000" value={closingText} placeholder="Awal dari kisah selamanya" onChange={(event) => setClosingText(event.target.value)} />
      </label>
      {isImmersiveTemplate(invitation.themeId)&&<section className="closing-placement"><h3>Posisi pasangan di penutup</h3>{[['scale','Besar pasangan',.3,1.5,.01],['x','Geser kiri / kanan',-300,300,5],['y','Geser atas / bawah',-300,300,5]].map(([key,label,min,max,step])=><label key={key} style={{display:'grid',gap:8,margin:'16px 0',fontSize:12}}>{label}<output>{key==='scale'?`${Math.round(closing[key]*100)}%`:closing[key]}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={closing[key]} onChange={e=>setClosing({...closing,[key]:Number(e.target.value)})}/></label>)}<Button type="button" variant="secondary" onClick={()=>setClosing(closingDefaults)}>Reset posisi penutup</Button></section>}
      <Button saveAction variant="primary" type="button" onClick={save} isLoading={saving}>{saving ? 'Menyimpan...' : 'Simpan Penutup'}</Button>
    </div>
  </div>;
}
