import {useEffect,useRef} from 'react';
let sharedModule;
function loadCoverModule(){
 if(!sharedModule)sharedModule=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.type='module';script.src='/templates/shared/cover-ambience.js';
  script.onload=()=>resolve(window.mountCoverAmbience);script.onerror=reject;document.head.append(script);
 }).catch(error=>{sharedModule=null;throw error});
 return sharedModule;
}
/** Signature covers share the same lifecycle and accessibility rules as Immersia. */
export default function CoverAmbience({theme,image,active=true}){
 const anchor=useRef(null),controller=useRef(null),latestActive=useRef(active);latestActive.current=active;
 useEffect(()=>{let cancelled=false,instance;const host=anchor.current?.parentElement;
  loadCoverModule().then(mountCoverAmbience=>{if(cancelled||!host)return;instance=mountCoverAmbience(host,{theme,image,active:latestActive.current});controller.current=instance}).catch(()=>{});
  return()=>{cancelled=true;instance?.destroy();controller.current=null};
 },[theme,image]);
 useEffect(()=>controller.current?.setActive(active),[active]);
 return <span ref={anchor} hidden aria-hidden="true"/>;
}
