import { useEffect, useRef, useState } from 'react';
import { SceneEngine } from './canvasRenderer.js';

const ART='/assets/landing-canvas/';
const base={x:0,y:0,z:1280,yaw:0,pitch:0,roll:0};
const poses=[base,{...base,y:-145,z:1080},{...base,x:-24,y:24,z:1430}];
const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*p*(p*(p*6-15)+10)};

/** A small, real layered-camera sample. No video, native scroll capture, or offscreen drawing. */
export default function PaintedGarden({ english=false }) {
 const stage=useRef(null),root=useRef(null),sceneRef=useRef(null),state=useRef({index:0,target:0,travel:null}),[index,setIndex]=useState(0),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const labels=english?['The invitation','The promise','The celebration']:['Sampul','Janji','Hari bahagia'];
 useEffect(()=>{
  let alive=true;
  const scene=new SceneEngine(stage.current,{layers:[{id:'garden',src:ART+'garden.webp',fit:'background',z:-1600},{id:'couple',src:ART+'couple.webp',width:510,preserveAspect:true,x:0,y:170,z:0},{id:'leaves',src:ART+'foliage.webp',fit:'foreground',z:260,opacity:.78,sway:.12,speed:.15}],intro:[{t:0,...base,z:1430,y:-10},{t:5,...base}]});sceneRef.current=scene;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function motionChange(){scene.motion=!reduced.matches}reduced.addEventListener('change',motionChange);
  const visible=new IntersectionObserver(([entry])=>{scene.running=entry.isIntersecting;scene.last=0},{rootMargin:'100px'});visible.observe(root.current);
  scene.onBeforeRender=stamp=>{
   const s=state.current;if(!s.travel)return;
   const t=s.travel;t.start??=stamp;const p=Math.min(1,(stamp-t.start)/t.duration),q=ease(p),arc=16*p*p*(1-p)*(1-p),pose={};
   for(const k of ['x','y','z','yaw','pitch','roll'])pose[k]=t.from[k]+(t.to[k]-t.from[k])*q;
   if(scene.motion){pose.x+=16*arc;pose.z-=55*arc;pose.roll+=.7*arc}
   scene.overridePose=pose;
   for(const node of scene.nodes)if(node.layer.id==='couple')node.opacity=t.fromOpacity+(t.toOpacity-t.fromOpacity)*q;
   root.current.style.setProperty('--pg-copy',ease((p-.58)/.42));
   if(p===1){s.index=s.target;s.travel=null;scene.activeMotion=false;if(alive)setBusy(false)}
  };
  scene.ready.then(()=>{if(alive)setReady(true)}).catch(()=>{if(alive){setFailed(true);setReady(true)}});
  return()=>{alive=false;visible.disconnect();reduced.removeEventListener('change',motionChange);scene.destroy();sceneRef.current=null;state.current={index:0,target:0,travel:null};};
 },[]);
 function go(next){const scene=sceneRef.current,s=state.current;if(!scene||!ready||busy||next===index)return;
  const couple=scene.nodes.find(n=>n.layer.id==='couple');s.target=next;s.travel={from:{...(scene.pose||base)},to:{...poses[next]},fromOpacity:couple?.opacity??1,toOpacity:next===1?.22:1,start:null,duration:scene.motion?2900:120};scene.activeMotion=true;root.current.style.setProperty('--pg-copy',0);setIndex(next);setBusy(true);
 }
 function pointer(e){const scene=sceneRef.current;if(!scene||busy||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();scene.pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5}}
 return <div className={`painted-garden pg-scene-${index}${ready?' is-ready':''}${failed?' is-fallback':''}`} ref={root} onPointerMove={pointer} onPointerLeave={()=>{if(sceneRef.current)sceneRef.current.pointer={x:0,y:0}}} aria-label={english?'Explore an illustrated wedding invitation':'Jelajahi ilustrasi undangan pernikahan'}>
  <div className="pg-stage" ref={stage} aria-hidden="true"/>
  <img className="pg-fallback" src={ART+'garden.webp'} alt="" aria-hidden="true"/>
  <span className="pg-edition">{english?'A LITTLE GARDEN, A BIG BEGINNING':'SEBUAH TAMAN, SEBUAH AWAL'}</span>
  <div className={`pg-story ${busy?'is-moving':''}`} aria-live="polite">
   {index===1?<><img src={ART+'cloud.webp'} alt=""/><blockquote>{english?'And of His signs is the love and mercy He places between you.':'Di antara tanda kebesaran-Nya, Dia menumbuhkan cinta dan kasih di antara kalian.'}<cite>QS. AR-RUM · 21</cite></blockquote></>:<div className="pg-names"><span>{index===2?(english?'SAVE OUR DATE':'HARI BAHAGIA KAMI'):'THE WEDDING OF'}</span><strong>Alina <i>&</i> Raka</strong><small>20 · 12 · 2026</small></div>}
  </div>
  <div className="pg-controls"><span>{english?'TAKE A LITTLE LOOK':'COBA JELAJAHI'}</span><div role="group" aria-label={english?'Invitation scenes':'Adegan undangan'}>{labels.map((label,i)=><button key={label} type="button" aria-pressed={index===i} disabled={!ready||busy} onClick={()=>go(i)}><span>0{i+1}</span>{label}</button>)}</div><small>{english?'Illustrative invitation sample':'Ilustrasi undangan contoh'} · <b>{String(index+1).padStart(2,'0')} / 03</b></small></div>
 </div>;
}
