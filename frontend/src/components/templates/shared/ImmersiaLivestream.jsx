import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import LivestreamCard from './LivestreamCard.jsx';
import {resolveImageUrl} from '../../../config/env.js';
export default function ImmersiaLivestream({frame,ready,settings={}}){
 const [target,setTarget]=useState(null);
 useEffect(()=>{if(!ready){setTarget(null);return}const doc=frame.current?.contentDocument,article=doc?.querySelector('#livestream article');if(!article)return;
 const old=[...article.querySelectorAll('.stream-window,.live-card,.configured')];old.forEach(n=>n.style.setProperty('display','none','important'));
 let css=doc.querySelector('#shared-livestream-css');if(!css){css=doc.createElement('link');css.id='shared-livestream-css';css.rel='stylesheet';css.href='/templates/shared/livestream-card.css';doc.head.append(css)}
 const mount=doc.createElement('div');mount.className='immersia-live-mount';article.append(mount);setTarget(mount);return()=>{mount.remove();old.forEach(n=>n.style.removeProperty('display'))}
 },[ready,frame]);
 return target?createPortal(<LivestreamCard url={settings.url} coverImage={resolveImageUrl(settings.coverImageUrl||'')} title="Siaran Pernikahan" portalTarget={target.ownerDocument.body}/>,target):null;
}
