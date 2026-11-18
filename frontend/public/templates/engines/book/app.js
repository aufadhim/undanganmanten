const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let opened=false,auto=false,menuOpen=false;
const sections=$$('.chapter');
const invitation=window.InvitationConfig;
function makeArt(type){const sources={couple:invitation.assets.galleryCouple,bouquet:invitation.assets.galleryBouquet,garden:invitation.assets.galleryGarden};const box=document.createElement('div'),img=document.createElement('img');box.className='garden-photo';img.src=sources[type]||sources.garden;img.alt='Galeri undangan';box.append(img);return box.outerHTML}
$$('[data-art]').forEach(el=>el.innerHTML=makeArt(el.dataset.art));
function setAuto(v){auto=v}
let coverTimer,transitionSerial=0;$('#section-menu').hidden=true;
function revealInvitation(){if(opened)return;opened=true;$('#journey').inert=false;$('#section-menu').hidden=false;$('.bottom-ui').hidden=false;document.body.classList.remove('locked','cover-handoff');$('#cover').classList.add('gone');window.dispatchEvent(new Event('invitation:opened'));$('#hero-title').setAttribute('tabindex','-1');$('#hero-title').focus({preventScroll:true})}
function resetToCover(){transitionSerial++;window.dispatchEvent(new Event('invitation:closed'));window.coverScene?.reset();if(window.coverScene)window.coverScene.paused=false;$('#pause-cover').textContent='Ⅱ';$('#pause-cover').setAttribute('aria-label','Jeda animasi');$('#cover').classList.remove('opening','scene-paused');$('#cover').style.opacity='';$('#open').disabled=false;clearTimeout(coverTimer);setAuto(false);opened=false;$('#section-menu').hidden=true;$('#journey').hidden=true;$('#journey').inert=false;$('.bottom-ui').hidden=true;document.body.classList.remove('cover-handoff');document.body.classList.add('locked');$('#cover').classList.remove('gone','leaving');window.scrollTo({top:0,behavior:'instant'});$('#open').focus()}
let returning=false;
async function cover(){
 if(returning)return;if(window.BookPortal&&opened){returning=true;menu(false);window.dispatchEvent(new Event('invitation:returning'));await window.BookPortal.toCover();resetToCover();returning=false;return}if(!opened){resetToCover();return}returning=true;setAuto(false);menu(false);window.dispatchEvent(new Event('invitation:returning'));
 document.body.classList.add('returning-to-cover');$('#journey').inert=true;
 const outgoing=window.heroScene,incoming=window.coverScene;const from={...(outgoing?.pose||{x:0,y:0,z:1280,yaw:0,pitch:0,roll:0})};
 incoming?.reset();if(incoming){incoming.paused=true;incoming.running=true;incoming.viewport.style.opacity='1'}
 if(outgoing)outgoing.activeMotion=true;if(incoming)incoming.activeMotion=true;
 const target={...(incoming?.config.intro[0]||{x:0,y:0,z:1160,yaw:0,pitch:0,roll:0})};
 $('#cover').classList.remove('gone','opening','leaving');$('#cover').style.opacity='0';
 await new Promise(resolve=>{let begin;function frame(t){begin??=t;const p=Math.min(1,(t-begin)/(reduced?220:3600)),e=p*p*(3-2*p),orbit=Math.sin(Math.PI*e);
  if(outgoing)outgoing.overridePose={...from,z:from.z-430*e,x:from.x-70*orbit,y:from.y-35*e,yaw:from.yaw-4*orbit,roll:from.roll+2.3*orbit};
  if(incoming)incoming.overridePose={...target,z:target.z+240*(1-e),x:target.x+50*orbit,yaw:target.yaw+3*orbit,roll:-1.8*orbit};
  const blend=Math.max(0,Math.min(1,(p-.38)/.58));$('#cover').style.opacity=String(blend*blend*(3-2*blend));
  if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});
 if(outgoing)outgoing.activeMotion=false;if(incoming)incoming.activeMotion=false;document.body.classList.remove('returning-to-cover');resetToCover();returning=false;
}
async function openInvitation(){
 if(opened||$('#open').disabled)return;
 const ticket=++transitionSerial;$('#open').disabled=true;
 // Lay out and decode the incoming scene before exposing any of it.
 $('#journey').hidden=false;$('#journey').inert=true;
 await Promise.all([window.coverScene?.ready,window.heroScene?.ready]);
 if(ticket!==transitionSerial)return;
 window.scrollTo({top:0,behavior:'instant'});window.dispatchEvent(new Event('invitation:prepare'));
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 if(ticket!==transitionSerial)return;
 if(window.BookPortal){document.body.classList.add('book-travelling');await window.BookPortal.enter();if(ticket!==transitionSerial)return;document.body.classList.remove('book-travelling');if(window.coverScene)window.coverScene.running=false;revealInvitation();await window.BookPortal.completeEntry();return}
 document.body.classList.add('cover-handoff');$('#cover').classList.add('opening');
 const outgoing=window.coverScene,incoming=window.heroScene;
 if(outgoing)outgoing.activeMotion=true;if(incoming)incoming.activeMotion=true;
 const from={...(outgoing?.pose||{x:0,y:0,z:1160,yaw:0,pitch:0,roll:0})};
 const to={...from,x:from.x,y:from.y-25,z:Math.max(560,from.z-580),yaw:from.yaw};
 const heroEnd={...(incoming?.config.intro[0]||from)};
 const heroFrom={...heroEnd,x:heroEnd.x+80,z:heroEnd.z+220,yaw:heroEnd.yaw+2};
 const duration=reduced?180:2800;
 const complete=await new Promise(resolve=>{
   let start;
   function frame(stamp){
    if(ticket!==transitionSerial){resolve(false);return}
    start??=stamp;let p=Math.min(1,(stamp-start)/duration),e=p*p*p*(p*(p*6-15)+10);
    if(outgoing){outgoing.overridePose={};for(let key of ['x','y','z','yaw','pitch','roll'])outgoing.overridePose[key]=from[key]+(to[key]-from[key])*e}
    if(incoming){incoming.overridePose={};for(let key of ['x','y','z','yaw','pitch','roll'])incoming.overridePose[key]=heroFrom[key]+(heroEnd[key]-heroFrom[key])*e}
    // Ease into the original orbit-and-push gesture, then hand off during the motion.
    if(!reduced){const orbit=Math.sin(Math.PI*e);if(outgoing){outgoing.overridePose.x-=70*orbit;outgoing.overridePose.yaw-=4.5*orbit;outgoing.overridePose.roll+=2.5*orbit}if(incoming){incoming.overridePose.x-=50*orbit;incoming.overridePose.yaw-=3*orbit;incoming.overridePose.roll+=1.8*orbit}}
    const blend=reduced?p:Math.max(0,Math.min(1,(p-.45)/.5));
    const fade=blend*blend*blend*(blend*(blend*6-15)+10);
    $('#cover').style.opacity=String(1-fade);
    if(p<1)requestAnimationFrame(frame);else resolve(true);
   }
   requestAnimationFrame(frame);
 });
 if(!complete||ticket!==transitionSerial)return;
 if(outgoing){outgoing.running=false;outgoing.activeMotion=false}if(incoming)incoming.activeMotion=false;
 revealInvitation();
}
const openButton = $('#open');
openButton.onclick = event => {
 if (event.isTrusted && !opened && !openButton.disabled &&
     new URLSearchParams(location.search).get('publicFullscreen') === '1' &&
     matchMedia('(pointer: coarse)').matches) {
  try {
   if (!document.fullscreenElement && document.fullscreenEnabled) {
    document.documentElement.requestFullscreen?.().catch(error => console.warn('Fullscreen undangan ditolak:', error.message));
   }
  } catch (error) {
   console.warn('Fullscreen undangan tidak tersedia:', error.message);
  }
 }
 return openInvitation();
};
$('#back-cover').onclick=cover;$('.monogram').onclick=e=>{e.preventDefault();cover()};
function menu(v){menuOpen=v;$('#chapters').hidden=!v;$('#chapter-backdrop').hidden=!v;$('#section-menu').setAttribute('aria-expanded',v);if(v){setAuto(false);window.invitationNavigator?.stopAuto?.();$('#close-menu').focus()}else $('#section-menu').focus()}
$('#section-menu').onclick=()=>menu(!menuOpen);$('#close-menu').onclick=()=>menu(false);$('#chapter-backdrop').onclick=()=>menu(false);const dotNav=document.createElement('nav');dotNav.className='section-dots';dotNav.setAttribute('aria-label','Pilih bagian undangan');$('.bottom-ui').append(dotNav);
dotNav.addEventListener('wheel', event => {
  if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || dotNav.scrollWidth <= dotNav.clientWidth) return;
  event.preventDefault();
  dotNav.scrollLeft += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? dotNav.clientWidth : 1);
}, { passive: false });
const dockLabels = {"cover":"Sampul","hero":"Pembuka","janji":"Doa","wanita":"Mempelai","pria":"Mempelai","countdown":"Tanggal","akad":"Acara","rundown":"Susunan","cerita":"Cerita","galeri":"Galeri","dresscode":"Busana","livestream":"Siaran","filter":"Bingkai","gift":"Hadiah","rsvp":"RSVP","penutup":"Penutup"};
let allTitles=['Cover sampul',...sections.map(s=>s.dataset.title)];allTitles.forEach((title,i)=>{let btn=document.createElement('button');let small=document.createElement('small');small.textContent=String(i+1).padStart(2,'0');btn.append(small,document.createTextNode(title));btn.onclick=()=>{menu(false);if(i===0)cover();else{if(!opened)openInvitation();window.invitationNavigator?window.invitationNavigator.goTo(sections[i-1]):sections[i-1].scrollIntoView({behavior:reduced?'instant':'smooth',block:sections[i-1].id==='hero'?'start':'center'})}};$('#nav-items').append(btn);const dot=document.createElement('button');dot.type='button';dot.className='section-dot';dot.setAttribute('aria-label',`${String(i+1).padStart(2,'0')} · ${title}`);dot.title=title;dot.onclick=btn.onclick;dot.dataset.scene=i===0?'cover':sections[i-1].id;btn.dataset.scene=dot.dataset.scene;dot.hidden=i>0&&window.GardenDisabledIds?.has(sections[i-1]?.id);const icon=document.createElement('span');
icon.className='dock-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24" focusable="false"><use href="/templates/shared/dock-watercolor.svg#'+(Object.hasOwn(dockLabels,dot.dataset.scene)?dot.dataset.scene:'hero')+'"/></svg>';
const label=document.createElement('span');
label.className='dock-label';label.textContent=dockLabels[dot.dataset.scene]||title;
dot.append(icon,label);
dot.onclick=()=>{if(dot.dataset.scene==='cover'||!window.invitationNavigator?.jumpTo)btn.onclick();else window.invitationNavigator.jumpTo(dot.dataset.scene)};
dotNav.append(dot)});

addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)menu(false);if(e.key==='Tab'&&menuOpen){const items=[...$('#chapters').querySelectorAll('button:not([hidden])')].filter(b=>b.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4500)}
const featureKeys={'Instagram mempelai wanita':'brideInstagram','Instagram mempelai pria':'groomInstagram','Peta lokasi acara':'location','Livestream':'livestream','Filter Instagram':'filter'};
$$('.configured').forEach(b=>{const url=invitation.links[featureKeys[b.dataset.feature]];if(url){if(b.dataset.feature==='Livestream')b.textContent='Tonton livestream ';if(b.dataset.feature==='Filter Instagram')b.textContent='Buka bingkai Instagram ';if(b.classList.contains('person-instagram'))b.parentElement.querySelector('.person-placeholder').hidden=true;b.onclick=()=>window.open(url,'_blank','noopener,noreferrer')}else b.onclick=()=>toast(b.dataset.feature+' belum diisi.')});
if(invitation.gift.number){const card=$('.bank-card');card.querySelector('h3').textContent=invitation.gift.bank;card.querySelector('p').textContent=invitation.gift.number;card.querySelector('small').textContent=invitation.gift.holder;card.parentElement.querySelector('.placeholder').hidden=true;const copy=document.createElement('button');copy.className='secondary';copy.textContent='Salin nomor rekening';copy.onclick=async()=>{try{await navigator.clipboard.writeText(invitation.gift.number);toast('Nomor rekening disalin.')}catch{toast('Salin nomor yang tertera: '+invitation.gift.number)}};card.append(copy)}
function countdown(){let sec=Math.max(0,Math.floor((new Date(invitation.event.start)-Date.now())/1000));$('#days').textContent=String(Math.floor(sec/86400)).padStart(2,'0');$('#hours').textContent=String(Math.floor(sec/3600)%24).padStart(2,'0');$('#minutes').textContent=String(Math.floor(sec/60)%60).padStart(2,'0');$('#seconds').textContent=String(sec%60).padStart(2,'0')}countdown();setInterval(countdown,1000);
function icsText(s){return String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m)}
function icsDate(s){return new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z')}
$('#calendar').onclick=()=>{const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Garden Canvas//Wedding//ID','BEGIN:VEVENT','UID:'+icsDate(invitation.event.start)+'@garden-canvas.local','DTSTAMP:'+icsDate(new Date()),'DTSTART:'+icsDate(invitation.event.start),'DTEND:'+icsDate(invitation.event.end),'SUMMARY:'+icsText('Pernikahan '+invitation.identity.bride+' & '+invitation.identity.groom),'DESCRIPTION:'+icsText(invitation.event.description),'LOCATION:'+icsText(invitation.event.location),'END:VEVENT','END:VCALENDAR'].join('\r\n');const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='undangan-pernikahan.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('Tanggal acara diunduh ke kalender.')};
const galleryNames={couple:'01 / Bersama',bouquet:'02 / Mekar',garden:'03 / Rumah'};$$('[data-gallery]').forEach(btn=>btn.onclick=()=>{setAuto(false);$('#lightbox-art').innerHTML=window.gardenGalleryArt?.[btn.dataset.gallery]||makeArt(btn.dataset.gallery);$('#lightbox-label').textContent=btn.querySelector('i').textContent;$('#lightbox').showModal()});$('#close-lightbox').onclick=()=>$('#lightbox').close();$('#lightbox').onclick=e=>{if(e.target===$('#lightbox'))$('#lightbox').close()};
let guest=new URLSearchParams(location.search).get('to');if(guest)$('#guest-name').textContent=guest.slice(0,100);

const isProfileScene=id=>id==='wanita'||id==='pria';
const dockOrder=['hero','wanita','countdown','akad','galeri','gift','rsvp'];
window.updateSectionDots=id=>{for(const dot of dotNav.children){const active=!dot.hidden&&(dot.dataset.scene===id||(isProfileScene(id)&&isProfileScene(dot.dataset.scene)));dot.classList.toggle('is-active',active);if(active){dot.setAttribute('aria-current','step');dotNav.scrollTo({left:dot.offsetLeft-dotNav.clientWidth/2+dot.clientWidth/2,behavior:reduced?'instant':'smooth'})}else dot.removeAttribute('aria-current')}};
window.syncSectionDots=route=>{const ids=['cover',...route];for(const container of [dotNav,$('#nav-items')]){const visibleIds=container===dotNav?dockOrder.map(id=>isProfileScene(id)?ids.find(isProfileScene):id).filter(id=>ids.includes(id)):ids;const nodes=[...container.children];for(const node of nodes)node.hidden=!visibleIds.includes(node.dataset.scene);visibleIds.forEach((id,i)=>{const node=nodes.find(n=>n.dataset.scene===id);if(!node)return;container.append(node);node.hidden=false;const title=id==='cover'?'Cover sampul':document.getElementById(id).dataset.title;node.setAttribute('aria-label',container===dotNav&&isProfileScene(id)?'Mempelai':`${String(i+1).padStart(2,'0')} · ${title}`);if(container!==dotNav)node.querySelector('small').textContent=String(i+1).padStart(2,'0')})}};
window.updateSectionDots('hero');
