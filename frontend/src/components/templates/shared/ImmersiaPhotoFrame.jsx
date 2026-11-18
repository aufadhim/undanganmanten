import {useEffect,useState} from 'react';import {createPortal} from 'react-dom';import PhotoFrame from './PhotoFrame.jsx';
export default function ImmersiaPhotoFrame({frame,ready,frameUrl,themeId,invitation}){
 const [target,setTarget]=useState(null);
 useEffect(()=>{if(!ready){setTarget(null);return}const doc=frame.current?.contentDocument,article=doc?.querySelector('#filter article');if(!article)return;
 const old=[...article.children];old.forEach(n=>n.style.setProperty('display','none','important'));
 let css=doc.querySelector('#shared-photo-frame-css');if(!css){css=doc.createElement('link');css.id='shared-photo-frame-css';css.rel='stylesheet';css.href='/templates/shared/photo-frame.css';doc.head.append(css)}
 const heading=doc.createElement('h2');heading.textContent='Bingkai Foto';article.append(heading);const mount=doc.createElement('div');article.append(mount);setTarget(mount);return()=>{heading.remove();mount.remove();old.forEach(n=>n.style.removeProperty('display'))}
 },[ready,frame]);
 return target?createPortal(<PhotoFrame invitation={invitation} themeId={themeId} frameUrl={frameUrl} portalTarget={target.ownerDocument.body}/>,target):null;
}
