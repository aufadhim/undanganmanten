export const JOURNEY_BLOCK_ORDER=['cover','quote','profile','countdown','events','rundown','story','gallery','dresscode','livestream','igFilter','gift','rsvp','wishes','footer'];
/** Business blocks determine visit order; scene IDs retain their own camera/room identity. */
export const BLOCK_SCENES={quote:['janji'],profile:['wanita','pria'],couple:['wanita','pria'],countdown:['countdown'],events:['akad'],gallery:['galeri'],story:['cerita'],rundown:['rundown'],dresscode:['dresscode'],livestream:['livestream'],igFilter:['filter'],gift:['gift'],rsvp:['rsvp'],wishes:['rsvp']};
export function createJourneyRoute(sceneIds,layout=[],disabled=new Set()){
 const blocked=new Set(disabled);for(const block of Array.isArray(layout)?layout:[])if(block.enabled===false&&!['rsvp','wishes'].includes(block.id))for(const id of BLOCK_SCENES[block.id]||[])blocked.add(id);
 const available=new Set(sceneIds);const route=[],seen=new Set();const add=id=>{if(available.has(id)&&!seen.has(id)&&(!blocked.has(id)||['hero','penutup'].includes(id))){route.push(id);seen.add(id)}};
 add('hero');for(const block of Array.isArray(layout)?layout:[])for(const id of BLOCK_SCENES[block.id]||[])if(block.enabled!==false)add(id);
 for(const id of sceneIds)if(!['hero','penutup'].includes(id))add(id);add('penutup');return route;
}
export function routeNeighbor(route,current,direction){const position=route.indexOf(current);return route[position+direction]??null;}
export function pinJourneyBlocks(items){return [...items.filter(i=>i.id==='cover').map(i=>({...i,enabled:true})),...items.filter(i=>!['cover','footer'].includes(i.id)),...items.filter(i=>i.id==='footer').map(i=>({...i,enabled:true}))];}
