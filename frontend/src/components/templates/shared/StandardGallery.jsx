import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {resolveImageUrl} from '../../../config/env.js';
import Lightbox from './Lightbox.jsx';
import './standard-gallery.css';

/** Canonical gallery for every theme: the same layouts, separate videos, shared lightbox. */
export default function StandardGallery({mediaList=[],layout='editorial',className=''}){
 const root=useRef(null),[activeIndex,setActiveIndex]=useState(null);
 const signature=JSON.stringify(Array.isArray(mediaList)?mediaList:[]);
 const media=useMemo(()=>JSON.parse(signature).map(item=>typeof item==='string'?{type:'photo',url:resolveImageUrl(item)}:{...item,type:item.type||'photo',url:resolveImageUrl(item.url||item.path)}),[signature]);
 const open=useCallback(index=>setActiveIndex(index),[]);
 useEffect(()=>{let cancelled=false,engine;const target=root.current,moduleUrl=new URL('/templates/shared/gallery-layout.js',window.location.origin).href;
  // An absolute asset URL avoids Vite rewriting public assets as source imports.
  import(/* @vite-ignore */moduleUrl).then(module=>{if(cancelled)return;engine=module;module.renderGallery(target,media,layout,{onOpen:open})}).catch(()=>{if(!cancelled)target.textContent='Galeri belum dapat dimuat.'});
  return()=>{cancelled=true;engine?.disposeGallery(target)};
 },[media,layout,open]);
 return <div className={`standard-gallery-root standard-gallery-scope ${className}`}><div ref={root} className="gallery-grid" data-layout={layout}/>{activeIndex!==null&&<Lightbox mediaList={media} initialIndex={activeIndex} onClose={()=>setActiveIndex(null)}/>}</div>
}
