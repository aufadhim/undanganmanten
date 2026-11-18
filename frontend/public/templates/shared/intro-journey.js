/** Optional first-room choreography. All poses remain in the existing world. */
const ids=new Set(['hero','janji','wanita','pria']);
const profile=id=>id==='wanita'||id==='pria';
const ease=p=>{p=Math.max(0,Math.min(1,p));return p*p*p*(p*(p*6-15)+10)};
const mix=(a,b,p)=>Object.fromEntries(['x','y','z','yaw','pitch','roll'].map(k=>[k,(a[k]||0)+((b[k]||0)-(a[k]||0))*p]));
export function createIntroFlight(fromId,toId,from,to,poseFor,settings,reduced=false){
 if(!settings||!ids.has(fromId)||!ids.has(toId)||fromId===toId)return null;
 const viaHero=fromId!=='hero'&&toId!=='hero'&&(profile(fromId)||profile(toId));
 const duration=reduced?180:(toId==='janji'?settings.quoteMs:profile(toId)?settings.profileMs:settings.returnMs)||4000;
 const keys=[{at:0,pose:{...from}}];
 if(viaHero&&!reduced){const overview=poseFor('hero');keys.push({at:duration*.42,pose:{...overview}},{at:duration*.52,pose:{...overview}})}
 keys.push({at:duration,pose:{...to}});
 return {keys,duration,viaHero,introGroup:true,revealAt:toId==='janji'?.73:.82};
}
export function sampleIntroFlight(flight,progress){
 if(progress<=0)return {...flight.keys[0].pose};if(progress>=1)return {...flight.keys.at(-1).pose};
 const time=progress*flight.duration;
 for(let i=1;i<flight.keys.length;i++){const a=flight.keys[i-1],b=flight.keys[i];if(time<=b.at)return mix(a.pose,b.pose,ease((time-a.at)/(b.at-a.at||1)))}
 return {...flight.keys.at(-1).pose};
}
export function introPairOpacity(fromId,toId,progress,flight,quoteOpacity=.12){
 const opacity=id=>id==='janji'?quoteOpacity:flight?.eventGroup?(['hero','wanita','pria','penutup'].includes(id)?1:0):1;
 const from=opacity(fromId),to=opacity(toId);
 if(flight?.viaHero){const [arrive,leave]=flight.heroWindow||[.42,.52];if(progress<arrive)return from+(1-from)*ease(progress/arrive);if(progress<leave)return 1;return 1+(to-1)*ease((progress-leave)/(1-leave))}
 return from+(to-from)*ease(progress);
}
export function placeProfilePanel(id,layout){
 const who=id==='wanita'?'Bride':'Groom',other=who==='Bride'?'Groom':'Bride';
 const right=(layout['hero'+who+'HeadX']??.68)>=(layout['hero'+other+'HeadX']??.3);
 document.getElementById(id==='wanita'?'bride-detail':'groom-detail')?.style.setProperty('--profile-left',right?'73%':'27%');
}
