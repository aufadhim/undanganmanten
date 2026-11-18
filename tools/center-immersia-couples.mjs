import fs from 'node:fs';
import path from 'node:path';
import {createLandscapeWorld} from '../frontend/public/templates/engines/landscape/world.js';
const root=path.resolve(import.meta.dirname,'..'),registry=JSON.parse(fs.readFileSync(path.join(root,'shared/template-registry.json')));
let count=0;
for(const t of registry.templates.filter(t=>t.engine)){
 const file=path.join(root,t.sceneSource),pack=JSON.parse(fs.readFileSync(file)),c=pack.invitation,comp=c.composition;
 comp.grounding.horizontalAlignment='visible-body-center';
 const world=t.engine===3?createLandscapeWorld(pack.landscape,c.assets):null;
 for(const slot of ['cover','hero','closing']){
  const art=comp.art[slot==='closing'?'hero':slot],mid=(art.bounds.left+art.bounds.right)/2-.5;
  let cameraX=0,origin=0;
  if(world){const character=pack.landscape.characters[slot],stop=pack.landscape.stops.find(s=>s.id===character.stop),area=pack.landscape.areas.find(a=>a.id===stop.area);cameraX=world.cameraFor(stop.id,390,844).x;origin=area.x+(stop.x||0);}
  else cameraX=(comp[slot]?.scaleGuide?.referencePose||c.cameras.find(p=>p.id===(slot==='closing'?'penutup':'hero'))?.mobile)?.x||0;
  const x=cameraX-origin-mid*c.layout[slot+'Width'];
  c.layout[slot+'X']=x;
  if(comp.grounding.placements?.[slot])comp.grounding.placements[slot].x=x;
  const ref=comp.grounding.paintingScale?.scenes?.[slot];if(ref)ref.centerOnCamera=true;
 }
 fs.writeFileSync(file,JSON.stringify(pack,null,2)+'\n');count++;
}
console.log(`Centered visible couple bounds for cover, hero and closing in ${count} templates.`);
