import {panelEnvelope,animateProgress,createVisibleClock} from '/templates/shared/transition-motion.js';
import {createEventGroupFlight} from '/templates/shared/event-group-journey.js';
import {fullBodyProfileCamera} from '/templates/shared/profile-framing.js';
import {createIntroFlight,sampleIntroFlight,introPairOpacity,placeProfilePanel} from '/templates/shared/intro-journey.js';
import {syncContactShadow} from '/templates/shared/character-grounding.js';
import {createJourneyRoute,routeNeighbor} from '/templates/shared/journey-route.js';
import {attachClouds,paintCloud,hideClouds} from '/templates/shared/runtime/cloud-backdrops.js?v=16';
import {SceneEngine} from './scene-engine.js?v=1';
const $=s=>document.querySelector(s),chapters=[...document.querySelectorAll('.chapter')],panels=chapters.map((c,i)=>i?c.querySelector('.paper'):null);
import {basePose as base,cameraPose,heroLayers} from './garden-theme.js?v=16';
const sceneIds=chapters.map(c=>c.id),sceneById=new Map(chapters.map((c,cameraIndex)=>[c.id,{element:c,cameraIndex,room:Number(c.dataset.room)}]));
let route=createJourneyRoute(sceneIds),routeDirty=false;
const layers=heroLayers();
const scene=new SceneEngine($('#hero-stage'),{layers,intro:[{t:0,...base}]});window.heroScene=scene;scene.running=false;
let active=false,current=0,travel=null,lastWheel=0,gestureUsed=false,wheelSum=0,touch=null,auto=false,timer=0;
const smooth=p=>{p=Math.max(0,Math.min(1,p));return p*p*p*(p*(p*6-15)+10)};
const room=i=>sceneById.get(chapters[i].id).room;
function pose(i){
 const id=chapters[i].id,layout=window.InvitationConfig.layout;
 if(['wanita','pria'].includes(id)&&layout.profileBodyFraming===1){
  const node=scene.nodes.find(n=>n.layer.id==='couple');
  if(node){placeProfilePanel(id,layout);return fullBodyProfileCamera({x:layout.heroX,y:layout.heroY,z:node.layer.z||0,width:layout.heroWidth,height:layout.heroWidth*node.img.naturalHeight/node.img.naturalWidth},layout,id,scene.width,scene.height,scene.focal)}
 }
 return cameraPose(sceneById.get(id).cameraIndex,innerWidth>=900);
}
for(let i=1;i<chapters.length;i++){const c=chapters[i],p=panels[i];p.classList.add('scene-panel');if(i>=4)p.classList.add('world-content');p.hidden=true;p.inert=true;if(i<chapters.length-1&&!p.querySelector('#arrum-next,#bride-next,#groom-next')){const b=document.createElement('button');b.className='world-next';b.textContent=chapters[i+1].dataset.title.toUpperCase();b.onclick=()=>goTo(i+1);p.append(b)}}
attachClouds(chapters,panels);
const alphaCache=[];
function panel(i,amount){if(Math.abs((alphaCache[i]??-1)-amount)<.00001)return;alphaCache[i]=amount;if(!i){$('#hero').style.setProperty('--hero-ui-opacity',amount);$('#hero .hero-content').inert=amount<.6;$('#hero .hero-tools').inert=amount<.6;return}paintCloud(i,amount);const p=panels[i];p.style.setProperty('--panel-opacity',amount);p.style.setProperty('--panel-lift',(1-amount)*8+'px');p.inert=amount<.7}
function compose(from,to,p){const roomWindow=travel?.introFlight?.roomBlend;const blend=room(from)===room(to)?0:roomWindow?smooth((p-roomWindow[0])/(roomWindow[1]-roomWindow[0])):smooth(p);const weights={};weights[room(from)]=1-blend;weights[room(to)]=(weights[room(to)]||0)+blend;
 for(const node of scene.nodes){const l=node.layer;if(l.room)node.opacity=weights[l.room]||0;else if(l.id==='couple'){const amount=i=>['hero','wanita','pria'].includes(chapters[i].id)?1:chapters[i].id==='janji'?(window.InvitationConfig.composition?.intro?.quoteOpacity??.45):chapters[i].id==='penutup'?(window.InvitationConfig.layout.closingOpacity??.88):0;node.opacity=travel?.introFlight?introPairOpacity(chapters[from].id,chapters[to].id,p,travel.introFlight,window.InvitationConfig.composition?.intro?.quoteOpacity??.12):amount(from)*(1-smooth(p))+amount(to)*smooth(p);const place=i=>chapters[i].id==='penutup'&&window.InvitationConfig.composition?.grounding?.version>=4?{x:window.InvitationConfig.layout.closingX,y:window.InvitationConfig.layout.closingY}:chapters[i].id==='penutup'?{x:(innerWidth>=900?-240:0)+(window.InvitationConfig.layout.closingX||0),y:(innerWidth>=900?130:125)+(window.InvitationConfig.layout.closingY||0)+(window.InvitationConfig.layout.heroWidth-(window.InvitationConfig.layout.closingWidth||window.InvitationConfig.layout.heroWidth))*(node.img.naturalHeight/node.img.naturalWidth)/2}:{x:window.InvitationConfig.layout.heroX,y:window.InvitationConfig.layout.heroY};const a=place(from),b=place(to),q=smooth(p);l.x=a.x+(b.x-a.x)*q;l.y=a.y+(b.y-a.y)*q;const size=i=>chapters[i].id==='penutup'?(window.InvitationConfig.layout.closingWidth||window.InvitationConfig.layout.heroWidth):window.InvitationConfig.layout.heroWidth;l.width=size(from)+(size(to)-size(from))*q;l.height=l.width*node.img.naturalHeight/node.img.naturalWidth;l.footY=chapters[p<.5?from:to].id==='penutup'?(window.InvitationConfig.layout.closingFootY??1):(window.InvitationConfig.layout.heroFootY??1);l.tint=[1-.08*(weights[4]||0),1-.04*(weights[4]||0),1]}else if(l.id==='contact-shadow'){continue}else{const night=weights[4]||0;node.opacity=(window.InvitationConfig.composition?.hero?.foreground?.opacity??.72)-.12*night;l.tint=[1-.38*night,1-.27*night,1-.12*night]}}
 syncContactShadow(scene.nodes.find(n=>n.layer.id==='couple'),scene.nodes.find(n=>n.layer.id==='contact-shadow'));
 const visibleRoom=String(p<.5?room(from):room(to));if($('#hero-stage').dataset.room!==visibleRoom)$('#hero-stage').dataset.room=visibleRoom;if(document.body.dataset.room!==visibleRoom)document.body.dataset.room=visibleRoom;
}
function updateCounter(i){const id=chapters[i].id,position=route.indexOf(id);$('#section-count').textContent=String(position+2).padStart(2,'0')+' / '+(route.length+1);$('#section-label').textContent=chapters[i].dataset.title;$('#track-fill').style.width=((position+1)/Math.max(route.length,1)*100)+'%';document.body.dataset.scene=id;window.parent.postMessage({type:'garden:scene',scene:document.body.classList.contains('locked')?'cover':id},location.origin);window.updateSectionDots?.(id);}
function refreshRoute(){route=createJourneyRoute(sceneIds,window.GardenLayoutOrder||[],window.GardenDisabledIds||new Set());window.syncSectionDots?.(route);if(travel){routeDirty=true;return}routeDirty=false;if(active&&!route.includes(chapters[current].id)){goTo(route[0]);return}updateCounter(current)}
function step(direction,manual=true){const id=routeNeighbor(route,chapters[current].id,direction);return id?goTo(id,manual):Promise.resolve()}
addEventListener('invitation:route-change',refreshRoute);

function stopAuto(){auto=false;clearTimeout(timer)}
function schedule(){if(auto)timer=setTimeout(async()=>{if(chapters[current].id===route.at(-1)){stopAuto();return}await step(1,false);schedule()},window.InvitationConfig.motion.autoplayMs)}
function available(){return active&&!travel&&!window.BookPortal?.busy&&!window.InvitationStage?.busy&&!document.body.classList.contains('returning-to-cover')&&$('#chapters').hidden&&!document.querySelector('dialog[open],.gallery-lightbox,.livestream-lightbox,.photo-frame-modal')}
async function goTo(index,manual=true,direct=false){if(manual)stopAuto();if(typeof index==='string')index=sceneById.get(index)?.cameraIndex;else if(typeof index!=='number')index=chapters.indexOf(index);if(!chapters[index]||!route.includes(chapters[index].id))return Promise.resolve();if(!available()||index<0||index>=chapters.length||index===current)return Promise.resolve();if(window.BookPortal&&(chapters[index].id==='penutup'||chapters[current].id==='penutup')){
  const from=current,to=index;document.body.setAttribute('aria-busy','true');travel={portal:true,resolve:()=>{}};await animateProgress(scene.motion?280:80,p=>panel(from,1-smooth(p)));document.body.classList.add('book-travelling');if(panels[to]){panels[to].hidden=false;panels[to].scrollTop=0;}
  if(chapters[to].id==='penutup'){compose(to,to,1);scene.overridePose=pose(to);await window.BookPortal.exit()}else{compose(to,to,1);scene.overridePose=pose(to);await window.BookPortal.enter()}
  if(panels[from])panels[from].hidden=true;current=to;travel=null;updateCounter(to);panel(to,0);document.body.classList.remove('book-travelling');document.body.removeAttribute('aria-busy');if(chapters[to].id!=='penutup')await window.BookPortal.completeEntry();travel={portal:true,resolve:()=>{}};await animateProgress(scene.motion?1100:120,p=>panel(to,smooth(p)));travel=null;if(routeDirty)refreshRoute();return;
 }scene.activeMotion=true;const from=current,to=index,cross=room(from)!==room(to);if(panels[to]){panels[to].hidden=false;panels[to].scrollTop=0;}
 const source={...(scene.pose||pose(from))},target=pose(to);updateCounter(to);document.body.classList.add('is-travelling');document.body.setAttribute('aria-busy','true');$('#scene-feedback').textContent='Menuju '+chapters[to].dataset.title+'…';
 const introFlight=!direct&&(createIntroFlight(chapters[from].id,chapters[to].id,source,target,id=>pose(sceneById.get(id).cameraIndex),window.InvitationConfig.composition?.intro,!scene.motion)||createEventGroupFlight(chapters[from].id,chapters[to].id,source,target,id=>pose(sceneById.get(id).cameraIndex),window.InvitationConfig.composition?.events,!scene.motion)||createEventGroupFlight(chapters[from].id,chapters[to].id,source,target,id=>pose(sceneById.get(id).cameraIndex),window.InvitationConfig.composition?.social,!scene.motion)||createEventGroupFlight(chapters[from].id,chapters[to].id,source,target,id=>pose(sceneById.get(id).cameraIndex),window.InvitationConfig.composition?.finale,!scene.motion));
 return new Promise(resolve=>travel={from,to,source,target,start:null,duration:direct?(scene.motion?520:1):introFlight?.duration??(scene.motion?(cross?window.InvitationConfig.motion.crossRoomMs:window.InvitationConfig.motion.sameRoomMs):180),introFlight,cross,resolve});}
scene.onBeforeRender=stamp=>{
 if(!active||window.BookPortal?.busy||window.BookPortal?.outside)return;if(travel?.portal)return;if(!travel){scene.overridePose=pose(current);return}const t=travel;t.start??=stamp;t.frames=(t.frames||0)+1;t.intervals??=[];if(t.last&&stamp-t.last<150)t.intervals.push(stamp-t.last);t.last=stamp;t.clock??=createVisibleClock();const p=Math.min(1,t.clock.step(stamp)/t.duration),e=smooth(p),arc=16*p*p*(1-p)*(1-p);const camera=t.introFlight?sampleIntroFlight(t.introFlight,p):{};if(!t.introFlight)for(const key of ['x','y','z','yaw','pitch','roll'])camera[key]=t.source[key]+(t.target[key]-t.source[key])*e;
 if(scene.motion&&!t.introFlight){camera.z+=(t.cross?210:-40)*arc;camera.x+=(t.cross?18:5)*arc;camera.yaw+=(t.cross?1.6:.18)*arc;camera.roll+=(t.cross?.9:.12)*arc}
 scene.overridePose=camera;compose(t.from,t.to,p);const alpha=panelEnvelope(p,t.duration,t.introFlight?.revealAt??.65);panel(t.from,alpha.out);panel(t.to,alpha.in);$('#scene-feedback').style.setProperty('--travel-progress',p);
 if(p===1){const sorted=t.intervals.sort((a,b)=>a-b);scene.canvas.dataset.transitionP95=(sorted[Math.floor(sorted.length*.95)]||0).toFixed(1);scene.canvas.dataset.transitionFrames=t.frames;scene.activeMotion=false;current=t.to;scene.overridePose=pose(current);compose(current,current,1);panel(current,1);if(panels[t.from])panels[t.from].hidden=true;paintCloud(t.from,0);travel=null;document.body.classList.remove('is-travelling');document.body.removeAttribute('aria-busy');$('#scene-feedback').textContent='';t.resolve();if(routeDirty)refreshRoute();}
};
function prepare(){refreshRoute();alphaCache.length=0;hideClouds();active=false;current=0;travel=null;scene.reset();scene.running=true;scene.paused=false;scene.overridePose=pose(0);for(let i=1;i<panels.length;i++){panels[i].hidden=true;panels[i].inert=true}panel(0,0);compose(0,0,1);document.body.classList.add('hero-space-visible');$('#hero-stage').style.opacity='1';updateCounter(0)}
addEventListener('invitation:prepare',prepare);let entryReveal=0;
addEventListener('invitation:opened',()=>{
 active=true;updateCounter(0);scene.running=true;scene.overridePose=pose(0);$('#hero').classList.add('hero-entered');
 cancelAnimationFrame(entryReveal);let start;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function reveal(stamp){
  if(!active||current!==0||travel)return;
  start??=stamp;const p=Math.max(0,Math.min(1,(stamp-start-(reduced?0:180))/(reduced?150:1350)));
  panel(0,smooth(p));if(p<1)entryReveal=requestAnimationFrame(reveal);
 }
 entryReveal=requestAnimationFrame(reveal);
});
function cancel(){scene.activeMotion=false;if(travel){travel.resolve();travel=null}stopAuto();document.body.classList.remove('is-travelling');document.body.removeAttribute('aria-busy');$('#scene-feedback').textContent=''}
addEventListener('invitation:returning',()=>{cancel();active=false});addEventListener('invitation:closed',()=>{window.parent.postMessage({type:'garden:scene',scene:'cover'},location.origin);hideClouds();cancel();active=false;scene.running=false;document.body.classList.remove('hero-space-visible');for(let i=1;i<panels.length;i++)panels[i].hidden=true});
addEventListener('resize',()=>{if(active&&!travel)scene.overridePose=pose(current)});
function editable(target){return target instanceof Element&&target.closest('input,textarea,select,[contenteditable="true"],#chapters,dialog,.section-dots')}
function innerScroll(target,delta){for(let el=target;el instanceof Element&&el!==document.body;el=el.parentElement)if(el.matches('.scene-panel,#wish-list,textarea,.gallery-grid,.ceremony-times,#host-bank-list,.gift-details-reveal,.immersia-confirmation,.guest-confirmation-wishes,.timeline,.schedule-list')&&el.scrollHeight>el.clientHeight+2&&((delta>0&&el.scrollTop+el.clientHeight<el.scrollHeight-2)||(delta<0&&el.scrollTop>2)))return true;return false}
addEventListener('wheel',event=>{if(event.target.closest('.section-dots'))return;if(!active||!$('#chapters').hidden||document.querySelector('dialog[open],.gallery-lightbox,.livestream-lightbox,.photo-frame-modal')||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;if(innerScroll(event.target,event.deltaY))return;event.preventDefault();stopAuto();const now=performance.now();if(now-lastWheel>300){gestureUsed=false;wheelSum=0}lastWheel=now;if(travel){gestureUsed=true;return}if(gestureUsed)return;const d=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(Math.sign(d)!==Math.sign(wheelSum))wheelSum=0;wheelSum+=d;if(Math.abs(wheelSum)>=6){gestureUsed=true;step(Math.sign(wheelSum))}},{passive:false});
addEventListener('touchstart',e=>{stopAuto();touch=active&&!editable(e.target)&&e.touches.length===1?{y:e.touches[0].clientY,used:false,inner:false}:null},{passive:true});
addEventListener('touchmove',e=>{if(!touch)return;const d=touch.y-e.touches[0].clientY;if(touch.inner){if(!innerScroll(e.target,d))e.preventDefault();return}if(innerScroll(e.target,d)){touch.inner=true;return}e.preventDefault();if(!touch.used&&Math.abs(d)>25){touch.used=true;if(!travel)step(Math.sign(d))}},{passive:false});addEventListener('touchend',()=>touch=null,{passive:true});addEventListener('touchcancel',()=>touch=null,{passive:true});
addEventListener('keydown',e=>{if(!active||editable(e.target)||e.metaKey||e.ctrlKey||e.altKey)return;const directions={ArrowDown:1,PageDown:1,ArrowUp:-1,PageUp:-1,' ':e.shiftKey?-1:1};if(!(e.key in directions)&&!['Home','End'].includes(e.key))return;if(e.key===' '&&e.target.closest('button,a'))return;e.preventDefault();if(e.repeat||travel)return;e.key==='Home'?goTo(route[0]):e.key==='End'?goTo(route.at(-1)):step(directions[e.key])});
addEventListener('pointerdown',e=>{if(!e.target.closest('#section-menu'))stopAuto()},{passive:true});addEventListener('focusin',e=>{if(editable(e.target))stopAuto()});
window.invitationNavigator={goTo,jumpTo:id=>goTo(id,true,true),step,refreshRoute,getRoute:()=>[...route],getCurrent:()=>chapters[current].id,stopAuto,toggleAuto(){if(auto){stopAuto();return}auto=true;schedule()}};
for(const [id,i] of [['hero-next',1],['arrum-next',2],['bride-next',3],['groom-next',4]])$('#'+id).onclick=()=>goTo(i);
$('#hero-replay').onclick=()=>goTo(0);$('#hero-pause').onclick=e=>{scene.paused=!scene.paused;e.currentTarget.textContent=scene.paused?'▷':'Ⅱ';e.currentTarget.setAttribute('aria-label',scene.paused?'Lanjutkan animasi hero':'Jeda animasi hero')};
scene.ready.catch(()=>{$('#scene-feedback').textContent='Taman belum termuat. Muat ulang untuk mencoba kembali.'});

refreshRoute();

window.refreshClosingCharacter=()=>{if(active&&!travel){compose(current,current,1);if(chapters[current].id==='penutup')window.BookPortal?.refresh?.()}};

addEventListener('visibilitychange',()=>{if(document.hidden)travel?.clock?.step(0,true)});
