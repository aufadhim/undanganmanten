/** Optional calm choreography for the countdown, ceremony and rundown group. */
const eventIds=new Set(['countdown','akad','rundown']);
const openingIds=new Set(['hero','janji','wanita','pria']);
export function createEventGroupFlight(fromId,toId,from,to,poseFor,settings,reduced=false,localOnly=false){
 if(!settings||fromId===toId)return null;
 const group=settings.ids?new Set(settings.ids):eventIds;
 const fromEvent=group.has(fromId),toEvent=group.has(toId);
 if(!fromEvent&&!toEvent||localOnly&&!(fromEvent&&toEvent))return null;
 const local=fromEvent&&toEvent,entering=toEvent&&!fromEvent;
 const duration=reduced?180:local?settings.localMs:entering?settings.entryMs:settings.exitMs;
 const keys=[{at:0,pose:{...from}}];let viaHero=false,heroWindow;
 if(!reduced&&!local){
  if(entering&&openingIds.has(fromId)){
   const hero=poseFor('hero');keys.push({at:duration*.34,pose:{...hero}},{at:duration*.44,pose:{...hero}});viaHero=true;heroWindow=[.34,.44];
  }
  if(!entering&&openingIds.has(toId)){
   const hero=poseFor('hero');keys.push({at:duration*.58,pose:{...hero}},{at:duration*.68,pose:{...hero}});viaHero=true;heroWindow=[.58,.68];
  }else keys.push({at:duration*.80,pose:{...to,z:to.z+(settings.overviewDepth??70)}});
 }
 keys.push({at:duration,pose:{...to}});
 return {keys,duration,eventGroup:true,viaHero,heroWindow,revealAt:.82,
  roomBlend:local?undefined:entering?[.40,.82]:[.10,.56]};
}
