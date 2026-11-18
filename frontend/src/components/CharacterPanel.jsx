import {useState,useRef} from 'react';
import {useUI} from '../context/UIContext.jsx';
import {api} from '../api/client.js';
import {resolveImageUrl} from '../config/env.js';
import {prepareCharacter} from '../utils/characterImage.js';
import './character-panel.css';
const placement=()=>({scale:1,x:0,y:0});

function PlacementCard({side,title,image,point,disabled,onChange,onFocus,onUpload,showHeads=true}){
 const [mark,setMark]=useState(null),[aspect,setAspect]=useState(point.aspect||2/3),input=useRef(null);
 function markHead(e){if(!mark)return;const r=e.currentTarget.getBoundingClientRect();const anchors=point.anchors||{bride:{x:.68,y:.3},groom:{x:.3,y:.15}};onChange({...point,anchors:{...anchors,[mark]:{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}});setMark(null)}
 return <section className="character-position-card"><header><h4>{title}</h4></header><div className="character-image-actions"><button type="button" onClick={onFocus}>Lihat preview</button>
 {onUpload&&<><input ref={input} type="file" accept="image/png,image/webp" hidden onChange={e=>onUpload(e,side)}/><button type="button" disabled={disabled} onClick={()=>input.current.click()}>{image?'Ganti ilustrasi':'Unggah ilustrasi'}</button></>}</div>
 {image&&<div className="character-proof"><span className="character-markable" style={{width:`min(100%, ${220*aspect}px)`}}><img src={resolveImageUrl(image)} alt={`Ilustrasi ${title}`} onLoad={e=>setAspect(e.currentTarget.naturalWidth/e.currentTarget.naturalHeight)} onClick={markHead} style={{cursor:mark?'crosshair':'default'}}/>{showHeads&&point.anchors&&Object.entries(point.anchors).map(([who,p])=><span key={who} className="character-head-label" style={{left:`${p.x*100}%`,top:`${p.y*100}%`}} aria-label={`Kepala ${who==='bride'?'wanita':'pria'}`}>{who==='bride'?'W':'P'}</span>)}</span></div>}
 <div className="character-placement">{[['scale','Besar karakter',.5,1.5,.05],['x','Kiri / kanan',-200,200,5],['y','Atas / bawah',-200,200,5]].map(([key,label,min,max,step])=><label key={key}>{title} · {label}<output>{key==='scale'?`${Math.round((point[key]??1)*100)}%`:point[key]??0}</output><input type="range" min={min} max={max} step={step} value={point[key]??(key==='scale'?1:0)} disabled={disabled} onFocus={onFocus} onChange={e=>onChange({...point,[key]:Number(e.target.value)})}/></label>)}</div>
 {image&&showHeads&&<><p>Arah kamera Hero</p><div className="character-head-actions"><button type="button" aria-pressed={mark==='bride'} disabled={disabled} onClick={()=>setMark('bride')}>Tandai kepala wanita</button><button type="button" aria-pressed={mark==='groom'} disabled={disabled} onClick={()=>setMark('groom')}>Tandai kepala pria</button></div>{mark&&<p role="status">Klik kepala {mark==='bride'?'wanita':'pria'} di gambar atas.</p>}</>}
 <button className="character-reset" type="button" disabled={disabled} onClick={()=>onChange({...point,...placement()})}>Reset posisi</button></section>
}

export default function CharacterPanel({invitation,onLivePreview,sandbox=false}){
 const settings=invitation.themeSettings||{},initial=settings.characterSettings||{mode:settings.coverImageUrl?'custom':'default',separatePose:false,cover:placement(),hero:placement()};
 const {profileImages:unusedProfileImages,...pairSettings}=initial;
 const [config,setConfig]=useState({...pairSettings,separatePose:false}),[art,setArt]=useState({coverImageUrl:settings.coverImageUrl||settings.coverSecondImageUrl||'',coverSecondImageUrl:''}),[path,setPath]=useState(initial.mode),[busy,setBusy]=useState(false);const {toast}=useUI();
 const live=useRef(onLivePreview),draft=useRef({config:initial,art});live.current=onLivePreview;
 function update(next=draft.current.config,images=draft.current.art){next={...next,separatePose:false};images={coverImageUrl:images.coverImageUrl||'',coverSecondImageUrl:''};draft.current={config:next,art:images};setConfig(next);setArt(images);live.current?.({characterSettings:next,...images})}
 function focus(side){window.dispatchEvent(new CustomEvent('invitation:placement-view',{detail:side}))}
 async function upload(e,side){const file=e.target.files?.[0];if(!file)return;e.target.value='';setBusy(true);const notification=toast.loading('Menyiapkan ilustrasi…');try{if(!file.type.startsWith('image/')||file.size>5*1048576)throw Error('Pilih gambar maksimal 5 MB.');const prepared=await prepareCharacter(file);let imageUrl;if(sandbox){imageUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(prepared.file)})}else{const body=new FormData();body.append('file',prepared.file);body.append('invitationId',invitation.id);const {data}=await api.post('/themes/upload-asset',body,{notification:false,onUploadProgress:e=>toast.update(notification,e.total?`Mengunggah ilustrasi… ${Math.round(e.loaded/e.total*100)}%`:'Mengunggah ilustrasi…')});imageUrl=data.url}update({...draft.current.config,mode:'custom',[side]:{...placement(),aspect:prepared.aspect}},{...draft.current.art,[side==='cover'?'coverImageUrl':'coverSecondImageUrl']:imageUrl});focus(side);toast.update(notification,'Ilustrasi berhasil diunggah.','success')}catch(e){toast.update(notification,e.response?.data?.error||e.message,'error')}finally{setBusy(false)}}
 function select(next){setPath(next);if(next==='default')update({...draft.current.config,mode:'default'});else if(next==='custom'&&draft.current.art.coverImageUrl)update({...draft.current.config,mode:'custom'})}
 const image=config.mode==='default'?'':art.coverImageUrl;
 return <section className="character-panel section-block"><h3>Karakter pasangan</h3><div className="character-paths" role="group" aria-label="Pilihan karakter">{[['default','Karakter bawaan'],['custom','Ilustrasi sendiri']].map(([id,label])=><button type="button" aria-pressed={path===id} onClick={()=>select(id)} key={id}>{label}</button>)}</div>
 <p>Satu ilustrasi, posisi Sampul dan Hero diatur terpisah.</p>
 <PlacementCard side="cover" title="Sampul" image={image} point={config.cover||placement()} disabled={busy} showHeads={false} onChange={point=>update({...draft.current.config,cover:point})} onFocus={()=>focus('cover')} onUpload={path==='custom'?upload:null}/>
 <PlacementCard side="hero" title="Hero" image={image} point={config.hero||placement()} disabled={busy} onChange={point=>update({...draft.current.config,hero:point})} onFocus={()=>focus('hero')}/>
 </section>;
}
