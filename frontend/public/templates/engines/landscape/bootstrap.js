import {readDraft,mergeConfig} from '/templates/shared/runtime/config-store.js?v=16';
try{
 const host=window.GardenHostData?await window.GardenHostData:null;
 const defaults=host?.config||await(async()=>{const response=await fetch('config/invitation.json',{cache:'no-cache'});if(!response.ok)throw Error('Konfigurasi tidak dapat dibaca.');return response.json()})();let config=mergeConfig(defaults,host?.config||defaults);const draftMode=new URLSearchParams(location.search).get('draft')==='1';
 if(draftMode){const draft=await readDraft();if(draft)config=mergeConfig(defaults,draft)}
 const mapResponse=await fetch('landscape.json',{cache:'no-cache'});if(!mapResponse.ok)throw Error('Peta landscape belum tersedia.');window.LandscapeDefinition=await mapResponse.json();window.InvitationConfig=config;window.LandscapeBaseCameras=structuredClone(defaults.cameras);
 const date=new Date(config.event.start),fmt=options=>new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',...options}).format(date),dateTokens={day:fmt({day:'2-digit'}),monthUpper:fmt({month:'long'}).toUpperCase(),monthName:fmt({month:'long'}),monthNumber:fmt({month:'2-digit'}),year:fmt({year:'numeric'}),dateLong:fmt({day:'numeric',month:'long',year:'numeric'}),dateUpper:fmt({day:'numeric',month:'long',year:'numeric'}).toUpperCase(),dateNumeric:fmt({day:'2-digit',month:'2-digit',year:'numeric'}).replaceAll('/','.'),weekdayUpper:fmt({weekday:'long'}).toUpperCase(),time:fmt({hour:'2-digit',minute:'2-digit',hourCycle:'h23'})};
 const tokens=s=>s.replace(/\{\{(\w+)\}\}/g,(_,k)=>config.identity[k]??dateTokens[k]??'');
 const walker=document.createTreeWalker(document,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()&&!n.parentElement.closest('script,style')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});const texts=[];while(walker.nextNode())texts.push(walker.currentNode);
 if(texts.length!==Object.keys(config.copy).length)throw Error('Versi teks dan template berbeda. Muat ulang atau gunakan konfigurasi yang sesuai.');
 texts.forEach((n,i)=>{n.nodeValue=tokens(config.copy['t'+String(i).padStart(3,'0')].value).replace(/[↗→↓↑↖←↘↙]/g,'')});window.GardenTextBindings=texts;document.querySelector("#section-menu").textContent="⋯";document.querySelector("#chapters .nav-head span").textContent="Daftar bagian";
 document.title=config.identity.bride+' & '+config.identity.groom+' — '+config.identity.title;
 document.querySelector('.monogram').textContent=config.identity.monogram;
 for(const s of config.sections)document.getElementById(s.id).dataset.title=s.title;
 const audio=document.getElementById('wedding-music');audio.src=config.assets.music;
 document.documentElement.style.setProperty('--cms-ink',config.style.ink);document.documentElement.style.setProperty('--cms-accent',config.style.accent);
 document.documentElement.style.setProperty('--cover-cloud',`url("${config.assets.cloud_cover}")`);
 const style=document.createElement('style');style.textContent='.demo-tag,#cover .cover-bottom,#cover .cover-controls,.hero-tools{display:none!important}header .monogram,header .edition,#cover .cover-bottom>span:first-child,#penutup .mini{display:none!important}header{justify-content:flex-end!important}.scene-panel h2,.paper.scene-panel h3,.hero-heading h2,.hero-heading h2 em,.hero-heading h2 span,#cover h1,#cover h1 em,header .monogram,header .edition{color:var(--cms-ink)!important}.primary{background:var(--cms-accent)}#cover .cover-response:before{background-image:var(--cover-cloud)}';document.head.append(style);
 if(draftMode){const b=document.createElement('div');b.textContent='PRATINJAU DRAF · belum diterbitkan';b.style.cssText='position:fixed;z-index:10000;top:0;left:0;padding:5px 10px;background:#40553c;color:white;font:10px sans-serif;pointer-events:none';document.body.append(b)}
 async function classic(src){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(src,import.meta.url).href;s.onload=resolve;s.onerror=reject;document.body.append(s)})}
 const musicReady=classic('/templates/shared/runtime/music.js?v=20').then(()=>window.InvitationMusicReady);
 const ivoryReady=import('/templates/shared/ivory-wash.js');

 await import('/templates/engines/landscape/journey.js?v=18');await classic('/templates/shared/runtime/app.js?v=25');await window.heroScene.ready;
 void import('/templates/shared/cover-ambience.js?v=23')
  .then(({mountCoverAmbience})=>mountCoverAmbience(document.querySelector('#cover'),{
   theme:location.pathname.split('/')[2],
   ready:Promise.all([window.coverScene?.ready,window.heroScene?.ready]),
  }).ready)
  .catch(error=>console.warn('Efek sampul tidak dapat dimuat.',error));
 const [,ivory]=await Promise.all([musicReady,ivoryReady]);
 ivory.mountIvoryReadability();document.body.dataset.cmsReady='true';window.applyGardenHost?.();
}catch(e){window.parent.postMessage({type:'garden:failed'},location.origin);console.error(e);const box=document.createElement('p');box.setAttribute('role','alert');box.style.cssText='position:fixed;z-index:99999;inset:25% 10%;padding:30px;background:#fff9ec;color:#40553c';box.textContent='Undangan belum dapat dibuka: '+e.message+' Jalankan melalui server lokal, bukan membuka file HTML langsung.';document.body.append(box)}
