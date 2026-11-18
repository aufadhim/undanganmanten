import {panelEnvelope,createVisibleClock} from '/templates/shared/transition-motion.js';
import {createEventGroupFlight} from '/templates/shared/event-group-journey.js';
import {createIntroFlight,sampleIntroFlight,introPairOpacity} from '/templates/shared/intro-journey.js';
import {syncContactShadow} from '/templates/shared/character-grounding.js';
import {coverCameraPose} from './cover-motion.js';
import {SceneEngine} from '/templates/shared/runtime/scene-engine.js?v=landscape-2';
import {createJourneyRoute,routeNeighbor} from '/templates/shared/journey-route.js';
import {createLandscapeWorld,sampleFlight,smooth,validateLoadedArt} from './world.js';
import {attachReadingWashes} from './reading-washes.js';
const $=s=>document.querySelector(s),config=window.InvitationConfig;
const landscape=createLandscapeWorld(window.LandscapeDefinition,config.assets);
const cameraFor=(id,w,h)=>landscape.cameraFor(id,w,h);
const chapters=[...document.querySelectorAll('.chapter')],ids=chapters.map(c=>c.id);
const panels=new Map(chapters.map(c=>[c.id,c.querySelector('.paper')]));
for(const id of ['cover',...ids])if(!landscape.stops.some(s=>s.id===id))throw Error(`Landscape: titik ${id} belum ada pada peta.`);
const viewport=document.createElement('div');viewport.id='landscape-stage';viewport.setAttribute('aria-hidden','true');document.body.prepend(viewport);
let viewportWidth, viewportHeight;
function measureViewport() {
 if (window.innerWidth <= 0 || window.innerHeight <= 0) return false;
 viewportWidth=window.innerWidth;
 viewportHeight=window.innerHeight;
 return true;
}
// A mobile editor can mount the preview while its iframe has no layout.
if (!measureViewport()) await new Promise(resolve=>{
 const observer=new ResizeObserver(()=>{
  if (!measureViewport()) return;
  observer.disconnect();
  resolve();
 });
 observer.observe(document.documentElement);
});
const scene=new SceneEngine(viewport,{renderer:new URLSearchParams(location.search).get('renderer')==='canvas'?'canvas':undefined,layers:landscape.layers(config.layout),intro:[{t:0,...cameraFor('cover',viewportWidth,viewportHeight)}]});
scene.ready=scene.ready.then(()=>validateLoadedArt(landscape.definition,scene.nodes));
window.heroScene=scene;window.coverScene=scene;scene.running=true;
let coverIntroStart=null,coverReturned=false;
let current='cover',route=createJourneyRoute(ids),travel=null,active=false,lastWheel=0,gestureUsed=false,wheelSum=0,touch=null,routeDirty=false;
const pose=id=>{
 if(['wanita','pria'].includes(id)){
  const pair=scene.nodes.find(n=>n.layer.slot==='hero');
  const aspect=pair?.img.naturalWidth?pair.img.naturalHeight/pair.img.naturalWidth:1.5;
  const p=landscape.profileCamera(id,viewportWidth,viewportHeight,config.layout,aspect);
  const selected=config.layout[id==='wanita'?'heroBrideHeadX':'heroGroomHeadX']??(id==='wanita'?.68:.3);
  const other=config.layout[id==='wanita'?'heroGroomHeadX':'heroBrideHeadX']??(id==='wanita'?.3:.68);
  panels.get(id)?.style.setProperty('--profile-left',selected>=other?'73%':'27%');
  return p;
 }
 return cameraFor(id,viewportWidth,viewportHeight);
};
let paintReadingWash=()=>{};
function reveal(id,amount){
 paintReadingWash(id,amount);
 const panel=panels.get(id);if(!panel)return;
 panel.style.setProperty('--panel-opacity',amount);panel.style.setProperty('--world-reveal',amount);panel.style.setProperty('--panel-lift',(1-amount)*8+'px');panel.style.setProperty('--world-lift',(1-amount)*8+'px');panel.inert=amount<.8;
 if(id==='hero')$('#hero').style.setProperty('--hero-ui-opacity',amount);
}
for(const [id,panel] of panels){panel.dataset.landscapePanel=landscape.stops.find(s=>s.id===id)?.panel||'center';panel.classList.add('scene-panel');if(!['hero','janji','wanita','pria'].includes(id))panel.classList.add('world-content');panel.hidden=true;panel.inert=true}
paintReadingWash=attachReadingWashes(panels);
function syncCharacters(){
 const layout=config.layout;
 for(const n of scene.nodes)if(n.layer.slot){const l=n.layer,side=l.slot;Object.assign(l,landscape.characterPose(side,layout,n.img.naturalHeight/n.img.naturalWidth));
  // A single visible figure travels between placements; do not crossfade two sizes.
  const crossing=travel&&(travel.fromId==='cover'||travel.toId==='cover');
  n.opacity=side==='cover'?(!crossing&&current==='cover'?1:0):side==='hero'?(crossing||current!=='cover'?1:0):1;
  if(side==='hero'&&crossing){
   const aspect=n.img.naturalHeight/n.img.naturalWidth;
   const a=landscape.characterPose(travel.fromId==='cover'?'cover':'hero',layout,aspect);
   const b=landscape.characterPose(travel.toId==='cover'?'cover':'hero',layout,aspect);
   const q=smooth(travel.progress||0);
   for(const key of ['x','y','z','width','height'])if(Number.isFinite(a[key])&&Number.isFinite(b[key]))l[key]=a[key]+(b[key]-a[key])*q;
  }
  if(side==='hero'&&!crossing&&config.composition?.intro)n.opacity*=introPairOpacity(travel?.fromId||current,travel?.toId||current,travel?(travel.progress||0):1,travel?.flight,config.composition.intro.quoteOpacity);
 }
 for(const n of scene.nodes){const a=n.layer.attachment;if(!a)continue;const pair=scene.nodes.find(p=>p.layer.slot===a.slot);if(pair){if(a.contact)syncContactShadow(pair,n);else{n.opacity=pair.opacity;n.layer.x=pair.layer.x;n.layer.y=pair.layer.y+pair.layer.height/2+(a.floorOffset||0)}}}
}
function report(id){
 document.body.dataset.scene=id;viewport.dataset.stop=id;viewport.dataset.world=landscape.definition.id;
 const index=route.indexOf(id);$('#section-count').textContent=String(index+2).padStart(2,'0')+' / '+(route.length+1);$('#section-label').textContent=document.getElementById(id)?.dataset.title||'Sampul';$('#track-fill').style.width=((index+1)/route.length*100)+'%';window.updateSectionDots?.(id);parent.postMessage({type:'garden:scene',scene:id},location.origin);
}
function refreshRoute(){route=createJourneyRoute(ids,window.GardenLayoutOrder||[],window.GardenDisabledIds||new Set());window.syncSectionDots?.(route);if(travel){routeDirty=true;return}routeDirty=false;if(active&&!route.includes(current))goTo(route[0]);else report(current)}
function animate(toId,{duration,cover=false,direct=false}={}){
 if(travel)return Promise.resolve(false);
 const fromId=current,from={...(scene.pose||pose(fromId))},to=pose(toId);
 const flight=(!cover&&!direct?createIntroFlight(fromId,toId,from,to,pose,config.composition?.intro,!scene.motion)||createEventGroupFlight(fromId,toId,from,to,pose,config.composition?.events,!scene.motion,true)||createEventGroupFlight(fromId,toId,from,to,pose,config.composition?.social,!scene.motion,true)||createEventGroupFlight(fromId,toId,from,to,pose,config.composition?.finale,!scene.motion,true):null)||landscape.planFlight(fromId,toId,from,viewportWidth,viewportHeight,{duration,establish:cover,direct,reduced:!scene.motion});
 // Head-marker adjustments belong to the final reading pose, not the scenic viewpoints.
 flight.keys[flight.keys.length-1].pose=to;
 if(panels.has(toId)){panels.get(toId).hidden=false;panels.get(toId).scrollTop=0;reveal(toId,0)}
 document.body.classList.add('is-travelling');document.body.setAttribute('aria-busy','true');scene.activeMotion=true;
 return new Promise(resolve=>{travel={fromId,toId,from,to,flight,start:null,duration:flight.duration,cover,resolve,intervals:[]}});
}
scene.onBeforeRender=stamp=>{
 if(!travel)syncCharacters();
 if(!travel){const base=pose(current);if(current==='cover'){const elapsed=coverIntroStart===null?0:Math.max(0,scene.time-coverIntroStart);scene.overridePose=landscape.clampPose(coverCameraPose(base,elapsed,{motion:scene.motion&&coverIntroStart!==null,intro:!coverReturned,pointer:scene.smooth}),viewportWidth,viewportHeight);scene.activeMotion=scene.motion&&!coverReturned&&coverIntroStart!==null&&elapsed<6}else scene.overridePose={...base};return}
 const t=travel;t.start??=stamp;if(t.last&&stamp-t.last<150)t.intervals.push(stamp-t.last);t.last=stamp;
 t.clock??=createVisibleClock();const p=Math.min(1,t.clock.step(stamp)/t.duration);t.progress=p;syncCharacters();scene.overridePose=(t.flight.introGroup||t.flight.eventGroup)?sampleIntroFlight(t.flight,p):sampleFlight(t.flight,p,!scene.motion);
 const alpha=panelEnvelope(p,t.duration,t.flight.revealAt??.65);reveal(t.fromId,alpha.out);reveal(t.toId,alpha.in);
 if(t.fromId==='cover')$('#cover .cover-inner').style.opacity=String(1-smooth(p/.32));
 if(t.toId==='cover')$('#cover .cover-inner').style.opacity=String(smooth((p-.68)/.32));
 if(p<1)return;
 current=t.toId;scene.overridePose=t.to;scene.activeMotion=false;
 if(panels.has(t.fromId))panels.get(t.fromId).hidden=true;
 reveal(current,1);travel=null;report(current);document.body.classList.remove('is-travelling');document.body.removeAttribute('aria-busy');
 t.intervals.sort((a,b)=>a-b);scene.canvas.dataset.transitionP95=(t.intervals[Math.floor(t.intervals.length*.95)]||0).toFixed(1);t.resolve(true);if(routeDirty)refreshRoute();
};
function available(){return active&&!travel&&!document.body.classList.contains('returning-to-cover')&&$('#chapters').hidden&&!document.querySelector('dialog[open],.gallery-lightbox,.livestream-lightbox,.photo-frame-modal')}
function goTo(value,direct=false){const id=typeof value==='string'?value:value instanceof Element?value.id:ids[value];if(!available()||!route.includes(id)||id===current)return Promise.resolve(false);return animate(id,direct?{duration:520,direct:true}:{})}
function step(direction){const next=routeNeighbor(route,current,direction);return next?goTo(next):Promise.resolve(false)}
window.invitationNavigator={goTo,jumpTo:id=>goTo(id,true),step,refreshRoute,getRoute:()=>[...route],getCurrent:()=>current,stopAuto(){}};
// Compatible with the shared cover controls; this moves ONE canvas, never swaps stages.
window.InvitationStage={outside:true,get busy(){return Boolean(travel)},handoff(){return animate('hero',{duration:4800,cover:true})},async returnToCover(){await animate('cover',{duration:1600,cover:true,direct:true})},replay(){scene.time=0}};
window.refreshClosingCharacter=syncCharacters;
addEventListener('cover:ambience-ready',()=>{coverIntroStart=scene.time});
addEventListener('pointermove',event=>{if(current!=='cover'||travel)return;scene.pointer={x:Math.max(-1,Math.min(1,event.clientX/viewportWidth*2-1)),y:Math.max(-1,Math.min(1,event.clientY/viewportHeight*2-1))}},{passive:true});
addEventListener('pointerout',event=>{if(!event.relatedTarget)scene.pointer={x:0,y:0}},{passive:true});
addEventListener('invitation:prepare',()=>{document.body.classList.add('hero-space-visible');$('#hero-stage').style.opacity='0'});
addEventListener('invitation:opened',()=>{active=true;reveal(current,1);refreshRoute()});
addEventListener('invitation:closed',()=>{active=false;current='cover';coverReturned=true;coverIntroStart=scene.time-6;for(const [id,panel]of panels){panel.hidden=true;reveal(id,0)}$('#cover .cover-inner').style.opacity='1';scene.overridePose=pose('cover');report('cover')});
let hiddenAt=0;addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=performance.now();travel?.clock?.step(0,true)}else if(hiddenAt){if(travel?.start)travel.start+=performance.now()-hiddenAt;hiddenAt=0}});
addEventListener('invitation:route-change',refreshRoute);addEventListener('resize',()=>{if(measureViewport()&&!travel)scene.overridePose=pose(current)});
function innerScroll(target,delta){for(let el=target;el instanceof Element&&el!==document.body;el=el.parentElement)if(el.matches('.scene-panel,textarea,.gallery-video-strip,.gallery-photo-viewport,.timeline,.schedule-list')&&el.scrollHeight>el.clientHeight+2&&((delta>0&&el.scrollTop+el.clientHeight<el.scrollHeight-2)||(delta<0&&el.scrollTop>2)))return true;return false}
const editable=target=>target instanceof Element&&target.closest('input,textarea,select,[contenteditable="true"],dialog,.section-dots');
addEventListener('wheel',e=>{if(!active||e.ctrlKey||e.target.closest('.section-dots')||Math.abs(e.deltaX)>Math.abs(e.deltaY)||document.querySelector('dialog[open],.gallery-lightbox,.livestream-lightbox,.photo-frame-modal'))return;if(innerScroll(e.target,e.deltaY))return;e.preventDefault();const now=performance.now();if(now-lastWheel>260){gestureUsed=false;wheelSum=0}lastWheel=now;if(travel){gestureUsed=true;return}if(gestureUsed)return;const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewportHeight:1);if(Math.sign(d)!==Math.sign(wheelSum))wheelSum=0;wheelSum+=d;if(Math.abs(wheelSum)>=6){gestureUsed=true;step(Math.sign(wheelSum))}},{passive:false});
addEventListener('touchstart',e=>{touch=active&&!editable(e.target)&&e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY,used:false,inner:false}:null},{passive:true});
addEventListener('touchmove',e=>{if(!touch||document.querySelector('dialog[open],.gallery-lightbox,.livestream-lightbox,.photo-frame-modal'))return;const d=touch.y-e.touches[0].clientY,dx=touch.x-e.touches[0].clientX;if(e.target.closest('.gallery-video-strip,.gallery-grid[data-layout=carousel]')&&Math.abs(dx)>Math.abs(d)){touch.used=true;return}if(touch.inner){if(!innerScroll(e.target,d))e.preventDefault();return}if(innerScroll(e.target,d)){touch.inner=true;return}e.preventDefault();if(!touch.used&&Math.abs(d)>25){touch.used=true;step(Math.sign(d))}},{passive:false});
addEventListener('touchend',()=>touch=null,{passive:true});addEventListener('touchcancel',()=>touch=null,{passive:true});
addEventListener('keydown',e=>{if(!available()||editable(e.target)||e.metaKey||e.ctrlKey||e.altKey)return;const direction={ArrowDown:1,ArrowUp:-1,PageDown:1,PageUp:-1,' ':e.shiftKey?-1:1}[e.key];if(e.key===' '&&e.target.closest('button,a'))return;if(direction){e.preventDefault();if(!e.repeat)step(direction)}else if(['Home','End'].includes(e.key)){e.preventDefault();goTo(e.key==='Home'?route[0]:route.at(-1))}});
$('#hero-replay').onclick=()=>goTo('hero');$('#hero-pause').onclick=()=>{scene.paused=!scene.paused};
scene.ready.then(()=>{$('#cover').classList.add('scene-ready');syncCharacters();report('cover')});
