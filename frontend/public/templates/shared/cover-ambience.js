/** Shared, cover-only choreography. Existing rich covers keep their own foregrounds. */
const botanical='/templates/shared/assets/cover-botanical.webp';
const jasmine='/templates/shared/assets/cover-jasmine.webp';
export const COVER_AMBIENCE_THEMES={
 ludora:{skin:'playful',foreground:null,fliers:'butterflies',petals:12,bubbles:14},
 'garden-canvas':{skin:'garden',foreground:null,fliers:null,petals:16,preload:['/templates/viridarium/assets/foliage-curtain.webp']},
 'sekar-jawa':{skin:'java',foreground:jasmine,frame:true,fliers:'birds',petals:20},
 pramaya:{skin:'temple',foreground:jasmine,frame:true,fliers:'butterflies',petals:18},
 riviera:{skin:'garden',foreground:botanical,fliers:'both',petals:20},
 wasesa:{skin:'java',foreground:jasmine,frame:true,fliers:null,petals:20,preload:['/templates/wasesa/assets/sunbird-flight-v1.webp','/templates/wasesa/assets/dove-flight-v1.webp']},
 eternal:{skin:'ivory',foreground:null,fliers:'butterflies',petals:14},
 seraya:{skin:'editorial',foreground:null,fliers:null,petals:18},
 nawasena:{existing:true},
};
export function coverAmbienceProfile(theme){return COVER_AMBIENCE_THEMES[theme==='viridarium'?'garden-canvas':theme]||null}
export function ambientParticles(count){return Array.from({length:count},(_,i)=>({x:(i*37+13)%100,size:4+(i*7%6),duration:15+(i*11%17),delay:-(i*3.7%29),drift:(i%2?-1:1)*(12+i%13),turn:180+(i*47%540)}))}
function loadStyle(doc){let link=doc.querySelector('#cover-ambience-css');if(link?.sheet)return Promise.resolve();return new Promise(resolve=>{if(!link){link=doc.createElement('link');link.id='cover-ambience-css';link.rel='stylesheet';link.href='/templates/shared/cover-ambience.css';doc.head.append(link)}link.addEventListener('load',resolve,{once:true});link.addEventListener('error',resolve,{once:true})})}
export function mountCoverAmbience(host,{theme,ready=Promise.resolve(),image,active=true}={}){
 const profile=coverAmbienceProfile(theme);if(!host||!profile||profile.existing)return{ready:Promise.resolve(),setActive(){},destroy(){}};
 const doc=host.ownerDocument,win=doc.defaultView,root=doc.createElement('div'),copies=[...host.querySelectorAll('.cover-inner,.cover-content,.seraya-opening-copy')];
 root.className='cover-ambience';root.dataset.skin=profile.skin;root.setAttribute('aria-hidden','true');host.classList.add('live-cover-host');copies.forEach(el=>el.classList.add('live-cover-copy'));host.append(root);
 let cancelled=false,requested=active,assetsReady=false,started=false;const removers=[];
 const add=(type,listener)=>{win.addEventListener(type,listener);removers.push(()=>win.removeEventListener(type,listener))};
 const make=(className,parent=root)=>{const el=doc.createElement('div');el.className=className;parent.append(el);return el};
 const images=new Set([...(image?[image]:[]),...(profile.preload||[])]);
 if(profile.foreground){images.add(profile.foreground);for(const corner of ['tl','tr','bl','br']){
  const holder=make('cover-ambient-corner '+corner),sprig=make('cover-ambient-sprig',holder);sprig.classList.toggle('is-frame',Boolean(profile.frame));sprig.style.backgroundImage=`url("${profile.foreground}")`;
 }}else if(['ivory','editorial'].includes(profile.skin)){for(const side of ['left','right'])make('cover-ambient-drape '+side)}
 for(let i=0;i<3;i++){const ray=make('cover-ambient-ray');ray.style.setProperty('--ca-ray',i)}
 for(const p of ambientParticles(profile.petals)){const petal=make('cover-ambient-petal');petal.style.cssText=`left:${p.x}%;--ca-size:${p.size}px;--ca-duration:${p.duration}s;--ca-delay:${p.delay}s;--ca-drift:${p.drift}vw;--ca-turn:${p.turn}deg`}
 for(let i=0;i<12;i++){const mote=make('cover-ambient-mote');mote.style.cssText=`left:${(i*31+7)%100}%;top:${(i*23+12)%90}%;--ca-delay:${-i*1.7}s;--ca-duration:${8+i%7}s`}
 for(let i=0;i<(profile.bubbles||0);i++){const bubble=make('cover-ambient-bubble');bubble.style.cssText=`left:${(i*37+8)%100}%;--bubble-size:${14+i*11%34}px;--bubble-duration:${15+i*7%16}s;--bubble-delay:${-i*2.3}s;--bubble-drift:${i%2?1:-1}`}
 if(['birds','both'].includes(profile.fliers)){for(let i=0;i<2;i++){const flight=make('cover-ambient-flight '+(i?'reverse':'')),bird=make('cover-ambient-bird',flight);const src='/templates/wasesa/assets/'+(i?'dove':'sunbird')+'-flight-v1.webp';images.add(src);bird.style.backgroundImage=`url("${src}")`;flight.style.cssText=`--ca-top:${22+i*23}%;--ca-flight:${26+i*7}s;--ca-delay:${-7-i*11}s;--ca-bird-size:${33-i*6}px`}}
 if(['butterflies','both'].includes(profile.fliers)){const src='/templates/shared/assets/cover-butterfly.webp';images.add(src);for(let i=0;i<2;i++){const flight=make('cover-ambient-butterfly flight-'+i),img=doc.createElement('img');img.src=src;img.alt='';img.draggable=false;flight.append(img)}}
 const sync=()=>{
  const visible=requested&&!['gone','opening','leaving','is-open','hide','hide-fade','hide-zoom','hide-slide-up','hide-slide-down'].some(c=>host.classList.contains(c));
  if(assetsReady&&visible&&!started){started=true;host.classList.add('live-cover-ready');root.classList.add('is-ready');win.dispatchEvent(new win.CustomEvent('cover:ambience-ready',{detail:{theme}}))}
  root.classList.toggle('is-dormant',!visible);root.classList.toggle('is-paused',!visible||doc.hidden);
 };
 const observer=new win.MutationObserver(sync);observer.observe(host,{attributes:true,attributeFilter:['class']});
 doc.addEventListener('visibilitychange',sync);add('invitation:prepare',()=>{requested=false;sync()});add('invitation:opened',()=>{requested=false;sync()});add('invitation:closed',()=>{requested=true;sync()});sync();
 const finished=Promise.allSettled([ready,loadStyle(doc),...([...images].filter(Boolean).map(src=>{const img=new win.Image();img.decoding='async';img.src=src;return img.decode()})),doc.fonts?Promise.race([doc.fonts.ready,new Promise(resolve=>win.setTimeout(resolve,1800))]):Promise.resolve()]).then(()=>{if(cancelled)return;assetsReady=true;sync()});
 return{ready:finished,setActive(value){requested=value;sync()},destroy(){cancelled=true;observer.disconnect();doc.removeEventListener('visibilitychange',sync);removers.forEach(fn=>fn());root.remove();host.classList.remove('live-cover-host','live-cover-ready');copies.forEach(el=>el.classList.remove('live-cover-copy'))}};
}

// Native module entry for React covers; avoids transforming public files through Vite.
if(typeof window!=="undefined")window.mountCoverAmbience=mountCoverAmbience;
