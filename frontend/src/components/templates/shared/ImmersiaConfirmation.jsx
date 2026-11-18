import {useEffect,useState} from 'react';import{createPortal}from'react-dom';import PublicForms from '../../PublicForms.jsx';
export default function ImmersiaConfirmation({frame,ready,invitation,guest,previewMode}){
 const[target,setTarget]=useState(null);
 useEffect(()=>{if(!ready){setTarget(null);return}const doc=frame.current?.contentDocument,article=doc?.querySelector('#rsvp article');if(!article)return;const subtitle=article.querySelector(':scope > h2 + p');subtitle?.classList.add('confirmation-subtitle');const old=[...article.children].filter(n=>!n.matches('h2,.kicker,.confirmation-subtitle'));old.forEach(n=>n.style.setProperty('display','none','important'));
 let css=doc.querySelector('#shared-confirmation-css');if(!css){css=doc.createElement('link');css.id='shared-confirmation-css';css.rel='stylesheet';css.href='/templates/shared/guest-confirmation.css';doc.head.append(css)}const node=doc.createElement('div');node.className='immersia-confirmation';article.append(node);setTarget(node);return()=>{node.remove();old.forEach(n=>n.style.removeProperty('display'))}
 },[ready,frame]);
 return target?createPortal(<PublicForms invitation={invitation} previewGuest={guest} previewMode={previewMode} hideSectionTitle/>,target):null;
}
