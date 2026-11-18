import {fullBodyProfileCamera} from '../../shared/profile-framing.js';
import {groundedCenter} from '../../shared/character-grounding.js';
/** Landscape engine contract v1. All art direction and coordinates live in the theme pack. */
const finite=(value,label)=>{if(!Number.isFinite(value))throw Error(`Landscape: ${label} harus berupa angka.`);return value};
const positive=(value,label)=>{if(finite(value,label)<=0)throw Error(`Landscape: ${label} harus lebih dari nol.`);return value};
export const smooth=p=>{p=Math.max(0,Math.min(1,p));return p*p*p*(p*(p*6-15)+10)};
export function viewportLens(width,height){positive(width,'viewport width');positive(height,'viewport height');return 1000*Math.min(width/(width<600?520:850),height/1050)}
export function validateLandscape(definition,assets){
 if(definition?.version!==1)throw Error('Landscape: versi peta tidak didukung.');
 const {world,areas,stops}=definition;if(!world||!Array.isArray(areas)||!areas.length||!Array.isArray(stops)||!stops.length)throw Error('Landscape: dunia, area, dan titik kamera wajib diisi.');
 positive(world.width,'world.width');positive(world.height,'world.height');finite(world.z,'world.z');finite(world.y??0,'world.y');if(!assets[world.asset])throw Error('Landscape: underpainting belum tersedia.');
 if(definition.motion?.overviewHoldMs!==undefined&&(finite(definition.motion.overviewHoldMs,'overviewHoldMs')<0||definition.motion.overviewHoldMs>3000))throw Error('Landscape: durasi panorama harus 0–3000 ms.');
 if(definition.motion?.durationScale!==undefined&&(finite(definition.motion.durationScale,'durationScale')<.5||definition.motion.durationScale>3))throw Error('Landscape: pengali durasi harus 0,5–3.');
 const areaIds=new Set(),stopIds=new Set();for(const a of areas){if(!a.id||areaIds.has(a.id))throw Error('Landscape: ID area harus unik.');areaIds.add(a.id);finite(a.x,'area.x');finite(a.y??0,'area.y');positive(a.width,'area.width');positive(a.height,'area.height');if(!assets[a.asset])throw Error(`Landscape: aset ${a.asset} belum tersedia.`);for(const k of ['x','y','width','height']){const n=a.landmark?.[k];finite(n,`landmark.${k}`);if(n<0||n>1||(k==='width'||k==='height')&&n===0)throw Error('Landscape: landmark harus berada pada koordinat 0–1.')}}
 for(const a of areas){const b=a.landmark;if(b.x-b.width/2<0||b.x+b.width/2>1||b.y-b.height/2<0||b.y+b.height/2>1)throw Error('Landscape: landmark harus sepenuhnya berada di dalam ilustrasi.')}
 for(let i=1;i<areas.length;i++){if(areas[i].x<=areas[i-1].x||areas[i].x-areas[i].width/2>areas[i-1].x+areas[i-1].width/2)throw Error('Landscape: area harus berurutan dan saling tersambung.')}
 for(const s of stops){if(!s.id||stopIds.has(s.id)||!areaIds.has(s.area))throw Error('Landscape: titik kamera harus unik dan merujuk area yang tersedia.');stopIds.add(s.id);for(const k of ['x','y','z','minZ'])if(s[k]!==undefined)finite(s[k],`stop.${k}`);if(s.fit!==undefined&&s.fit!=='landmark')throw Error('Landscape: framing kamera tidak dikenal.');if(s.panel!==undefined&&!['top','center'].includes(s.panel))throw Error('Landscape: posisi panel tidak dikenal.')}
 for(const required of ['cover','hero','penutup'])if(!stopIds.has(required))throw Error(`Landscape: titik ${required} wajib diisi.`);
 for(const d of definition.decorations||[]){if(!assets[d.asset]||!areaIds.has(d.area))throw Error('Landscape: ilustrasi pendukung memerlukan aset dan area yang valid.');positive(d.width,'decoration.width');}
 for(const slot of ['cover','hero','closing']){const c=definition.characters?.[slot];if(!c||!stopIds.has(c.stop))throw Error(`Landscape: penempatan karakter ${slot} belum lengkap.`);finite(c.y,'character.y');}
 return definition;
}
export function travelPose(from,to,progress,reduced=false){if(progress<=0)return {...from};if(progress>=1)return {...to};const q=smooth(progress),pose={};for(const key of ['x','y','z','yaw','pitch','roll'])pose[key]=(from[key]||0)+((to[key]||0)-(from[key]||0))*q;if(!reduced&&(Math.abs(to.x-from.x)+Math.abs(to.y-from.y)+Math.abs(to.z-from.z)>1)){const arc=16*q*q*(1-q)*(1-q);pose.y-=12*arc;pose.roll=Math.sign(to.x-from.x)*.16*arc}return pose}
export function sampleFlight(flight,progress,reduced=false){if(progress<=0)return {...flight.keys[0].pose};if(progress>=1)return {...flight.keys.at(-1).pose};const time=progress*flight.duration;for(let i=1;i<flight.keys.length;i++){const a=flight.keys[i-1],b=flight.keys[i];if(time<=b.at)return travelPose(a.pose,b.pose,(time-a.at)/(b.at-a.at||1),reduced)}return {...flight.keys.at(-1).pose}}
export function validateLoadedArt(definition,nodes){
 const expected=[['landscape-underpainting',definition.world.width,definition.world.height],...definition.areas.map(a=>['landscape-area-'+a.id,a.width,a.height])];
 for(const [id,width,height]of expected){const n=nodes.find(n=>n.layer.id===id);if(!n||Math.abs((n.img.naturalWidth/n.img.naturalHeight)/(width/height)-1)>.02)throw Error(`Landscape: rasio gambar ${id} berbeda dari peta. Sesuaikan width/height tanpa meregangkan gambar.`)}
}
export function createLandscapeWorld(definition,assets){
 validateLandscape(definition,assets);
 const areaById=new Map(definition.areas.map(a=>[a.id,a])),stopById=new Map(definition.stops.map(s=>[s.id,s]));
 const world=definition.world;
 function clampPose(p,width,height){const lens=viewportLens(width,height),distance=p.z-world.z,halfW=width/2*distance/lens,halfH=height/2*distance/lens;
  const maxX=Math.max(0,world.width/2-halfW-50),maxY=Math.max(0,world.height/2-halfH-50),cy=world.y||0;return{...p,x:Math.max(-maxX,Math.min(maxX,p.x)),y:Math.max(cy-maxY,Math.min(cy+maxY,p.y))};
 }
 function cameraFor(id,width,height,{overview=false}={}){
  const s=stopById.get(id);if(!s)throw Error(`Landscape: titik ${id} tidak ditemukan.`);const a=areaById.get(s.area),lens=viewportLens(width,height),fit=overview||s.fit==='landmark';
  // Landmarks are framed by BOTH axes; phone portrait and desktop share physical coordinates.
  const centerY=(a.y||0)+(a.landmark.y-.5)*a.height;
  const desiredY=fit?(overview?centerY:centerY-a.height*.04+(s.y||0)):(s.y||0);
  const boxHeight=a.landmark.height*a.height+2*Math.abs(centerY-desiredY);
  const framedDistance=Math.max((a.landmark.width*a.width+2*Math.abs(overview?0:(s.x||0)))/width,boxHeight/height)*lens*(overview?1.3:1.12);
  const z=fit?Math.max(s.minZ||1500,framedDistance+world.z):(s.z||1700);
  const x=a.x+(fit?(a.landmark.x-.5)*a.width:0)+(overview?0:(s.x||0));
  const halfView=height/2*(z-world.z)/lens,verticalRoom=Math.max(0,a.height/2-halfView-60);
  const originY=a.y||0;
  const y=fit?Math.max(originY-verticalRoom,Math.min(originY+verticalRoom,desiredY)):desiredY;
  return clampPose({x,y,z,yaw:0,pitch:0,roll:0},width,height);
 }
 function layers(layout){return[
  {id:'landscape-underpainting',src:assets[world.asset],x:0,y:world.y||0,z:world.z-100,width:world.width,height:world.height,preserveAspect:true},
  ...definition.areas.map(a=>({id:'landscape-area-'+a.id,src:assets[a.asset],x:a.x,y:a.y||0,z:world.z,width:a.width,height:a.height,preserveAspect:true,edgeFade:[a.feather??.12,.045]})),
  ...(definition.decorations||[]).map(d=>{const a=areaById.get(d.area);return{id:d.id,src:assets[d.asset],x:a.x+(d.x||0),y:d.y||0,z:d.z||0,width:d.width,preserveAspect:true,sway:d.sway||0,speed:.12,opacity:d.opacity??1,anchor:d.anchor,attachment:d.attachment}}),
  ...Object.entries(definition.characters).map(([slot,c])=>{const s=stopById.get(c.stop),a=areaById.get(s.area);return{id:slot==='cover'?'opening-pair':slot==='hero'?'couple':'closing-pair',slot,footY:layout[slot+'FootY']??layout.heroFootY??1,src:assets[slot==='cover'?'coverCouple':'heroCouple'],x:a.x+(s.x||0),y:c.y,z:c.z||0,width:layout[slot+'Width']||layout.heroWidth*.72,preserveAspect:true}})
 ];}
 function characterPose(slot,layout,aspect){const c=definition.characters[slot],s=stopById.get(c.stop),a=areaById.get(s.area),width=layout[slot+'Width']||layout.heroWidth*.72,height=width*aspect;
  const baseline=c.width||width;const footY=layout[slot+'FootY']??layout.heroFootY??1;const y=slot==='closing'?(c.aspect?c.y+baseline/c.aspect*((c.footY??1)-.5)-height*(footY-.5)+(layout.closingY||0):groundedCenter(c.y,baseline,width,aspect,layout.closingY||0,footY)):layout[slot+'Y']??c.y;
  return{x:a.x+(s.x||0)+(layout[slot+'X']||0),y,z:c.z||0,width,height,footY:layout[slot+'FootY']??layout.heroFootY??1};
 }
 // Head markers select the subject; the full body determines the zoom distance.
 function profileCamera(id,width,height,layout,aspect){
  return fullBodyProfileCamera(characterPose('hero',layout,aspect),layout,id,width,height,viewportLens(width,height));
 }
 function planFlight(fromId,toId,from,width,height,{duration,establish=false,reduced=false,direct=false}={}){
  const hold=definition.motion?.overviewHoldMs??650;
  const to=cameraFor(toId,width,height),source=stopById.get(fromId),target=stopById.get(toId),keys=[{at:0,pose:{...from}}];let clock=0;
  const add=(p,ms)=>{clock+=ms;keys.push({at:clock,pose:p})};
  if(reduced||direct){const ms=reduced?180:(duration||1600);add(to,ms);return{keys,duration:ms}}
  if(source.area!==target.area||establish){
   const a=definition.areas.findIndex(a=>a.id===source.area),b=definition.areas.findIndex(a=>a.id===target.area),direction=Math.sign(b-a)||1;
   const overview=id=>cameraFor(id,width,height,{overview:true});add(overview(fromId),900);add(overview(fromId),hold);
   for(let i=a+direction;direction>0?i<=b:i>=b;i+=direction){const area=definition.areas[i],stop=definition.stops.find(s=>s.area===area.id),p=overview(stop.id);add(p,Math.min(2400,1500+Math.abs(p.x-keys.at(-1).pose.x)*.07));add(p,hold)}
   add(to,1000);
  }else add(to,Math.min(2800,1600+Math.abs(to.x-from.x)*.25+Math.abs(to.z-from.z)*.2));
  const scale=definition.motion?.durationScale??1.6;const total=duration||Math.min(14000,Math.max(source.area===target.area&&!establish?3600:0,clock*scale));for(const key of keys)key.at*=total/clock;
  return{keys,duration:total};
 }
 return{definition,world,stops:definition.stops,areas:definition.areas,cameraFor,layers,characterPose,profileCamera,planFlight,clampPose};
}
