import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import SaveTheDate from './SaveTheDate.jsx';

/** Render the shared React date component inside the Immersia scene's document. */
export default function ImmersiaSaveTheDate({frame,ready,event,identity}){
 const [target,setTarget]=useState(null),[now,setNow]=useState(Date.now());
 useEffect(()=>{if(!ready){setTarget(null);return}const doc=frame.current?.contentDocument,article=doc?.querySelector('#countdown article');if(!article)return;
  const old=[...article.querySelectorAll('.countdown,#calendar,.mini')];old.forEach(el=>el.style.setProperty('display','none','important'));
  let link=doc.querySelector('#shared-save-date-css');if(!link){link=doc.createElement('link');link.id='shared-save-date-css';link.rel='stylesheet';link.href='/templates/shared/save-the-date.css';doc.head.append(link)}
  const node=doc.createElement('div');node.className='immersia-save-date-mount';article.append(node);setTarget(node);
  return()=>{node.remove();old.forEach(el=>el.style.removeProperty('display'))}
 },[ready,frame]);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);
 if(!target)return null;
 const sec=Math.max(0,Math.floor((Date.parse(event.start)-now)/1000)),countdown={days:Math.floor(sec/86400),hours:Math.floor(sec/3600)%24,mins:Math.floor(sec/60)%60,secs:sec%60};
 const stamp=v=>new Date(v).toISOString().replace(/-|:|\.\d+/g,'');
 const query=new URLSearchParams({action:'TEMPLATE',text:`${event.description?.startsWith('Ngunduh Mantu ') ? 'Ngunduh Mantu' : 'Pernikahan'} ${identity.bride} & ${identity.groom}`,dates:`${stamp(event.start)}/${stamp(event.end)}`,details:event.description||'',location:event.location||''});
 return createPortal(<SaveTheDate className="save-the-date-immersia" date={event.start} countdown={countdown} calendarUrl={`https://calendar.google.com/calendar/render?${query}`} buttonLabel="Simpan tanggal"/>,target);
}
