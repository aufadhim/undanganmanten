import {useEffect,useState} from 'react';import{createPortal}from'react-dom';import GiftDetails from './GiftDetails.jsx';
export default function ImmersiaGift({frame,ready,gift}){
 const[target,setTarget]=useState(null);
 useEffect(()=>{if(!ready){setTarget(null);return}const doc=frame.current?.contentDocument,article=doc?.querySelector('#gift article');if(!article)return;const old=[...article.querySelectorAll(':scope > p,.bank-card,#host-bank-list,.placeholder')];old.forEach(n=>n.style.setProperty('display','none','important'));let css=doc.querySelector('#shared-gift-css');if(!css){css=doc.createElement('link');css.id='shared-gift-css';css.rel='stylesheet';css.href='/templates/shared/gift-details.css';doc.head.append(css)}const mount=doc.createElement('div');article.append(mount);setTarget(mount);return()=>{mount.remove();old.forEach(n=>n.style.removeProperty('display'))}
 },[ready,frame]);
 return target?createPortal(<GiftDetails gift={gift}/>,target):null;
}
