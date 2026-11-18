import fs from 'node:fs';
import path from 'node:path';
import sharp from '../../backend/node_modules/sharp/dist/index.mjs';
import {environmentPlane} from '../../frontend/public/templates/shared/character-grounding.js';
import {resolvePaintedHumanHeight,placePairInPainting} from '../../frontend/public/templates/shared/painted-scale.js';
import {createLandscapeWorld,viewportLens} from '../../frontend/public/templates/engines/landscape/world.js';
const root=path.resolve(import.meta.dirname,'../..');
export async function calibrateTemplate(id,{quiet=false,slots}={}){
 const registry=JSON.parse(fs.readFileSync(path.join(root,'shared/template-registry.json'))),t=registry.templates.find(t=>t.id===id);
 if(!t?.engine)throw Error('Unknown Immersia template');
 const file=path.join(root,t.sceneSource),pack=JSON.parse(fs.readFileSync(file)),c=pack.invitation,comp=c.composition,cal=comp.grounding.paintingScale;
 if(!cal)throw Error(id+': add measured paintingScale references first; no guessed screen-size fallback');
 const W=390,H=844,focal=viewportLens(W,H),results={};
 for(const [slot,ref]of Object.entries(cal.scenes)){
  if(slots&&!slots.includes(slot))continue;
  const resolved=resolvePaintedHumanHeight(ref),art=comp.art[slot==='closing'?'hero':slot];
  let camera,plane,environmentZ,characterZ=0,area,character;
  if(t.engine===3){
   character=pack.landscape.characters[slot];const stop=pack.landscape.stops.find(s=>s.id===character.stop);area=pack.landscape.areas.find(a=>a.id===stop.area);
   if(ref.framing){
    const currentCoverage=area.height*focal/(stop.z-pack.landscape.world.z)/H;
    const coverage=Math.max(1.12,Math.min(ref.framing.maximumCoverage||2.6,Math.max(ref.framing.minBody/resolved.height,Math.min(currentCoverage,ref.framing.maxBody/resolved.height))));
    stop.z=pack.landscape.world.z+area.height*focal/(H*coverage);
    stop.y=(area.y||0)+(ref.footY-.5)*area.height-(ref.screenFootY-.5)*H*(stop.z-pack.landscape.world.z)/focal;
    delete stop.fit;delete stop.minZ;
   }
   camera=createLandscapeWorld(pack.landscape,c.assets).cameraFor(stop.id,W,H);plane={width:area.width,height:area.height,x:area.x,y:area.y||0};environmentZ=pack.landscape.world.z;characterZ=character.z||0;
  }else{
   const stage=t.engine===1&&['cover','closing'].includes(slot)&&Boolean(c.assets.stageLandscape);
   environmentZ=stage?-2200:-1600;
   camera=stage?{x:0,y:slot==='closing'?-30:15,z:slot==='closing'?1340:1160}:slot==='cover'?{x:0,y:0,z:1280}:{...c.cameras.find(p=>p.id===(slot==='closing'?'penutup':'hero')).mobile};
   const asset=ref.asset||(stage?'stageLandscape':slot==='closing'?'room4':'room1');
   const src=c.assets[asset],meta=await sharp(src.startsWith('/')?path.join(root,'frontend/public',src):path.join(root,'frontend/public/templates/viridarium',src)).metadata();
   const guide={adultHeight:resolved.height,groundY:ref.footY,footLine:ref.screenFootY,minimumCoverage:ref.minimumCoverage||1.32,bodyFraction:0,referencePose:camera};
   if(ref.framing)guide.minimumCoverage=Math.max(guide.minimumCoverage,Math.min(ref.framing.maximumCoverage||2.6,ref.framing.minBody/resolved.height));
   plane=environmentPlane(guide,{width:W,height:H,focal,aspect:meta.width/meta.height,z:environmentZ});comp[slot].scaleGuide=guide;
   if(stage&&slot==='cover')comp.cover.layers['stage-landscape'].scaleGuide=guide;
   if(slot==='closing')comp.closing.absolutePosition=true;
  }
  const p=placePairInPainting({art,plane,environmentZ,camera,characterZ,humanHeight:resolved.height,footX:ref.footX,footY:ref.footY});
  if(ref.centerOnCamera)p.x=camera.x-((art.bounds.left+art.bounds.right)/2-.5)*p.width;
  if(t.engine===3){const stop=pack.landscape.stops.find(s=>s.id===character.stop);p.x-=area.x+(stop.x||0);Object.assign(character,{width:p.width,y:p.y,aspect:art.aspect,footY:p.footY});}
  Object.assign(c.layout,{[slot+'Width']:p.width,[slot+'X']:p.x,[slot+'Y']:t.engine===3&&slot==='closing'?0:p.y,[slot+'FootY']:p.footY});
  comp.grounding.placements[slot]=p;
  const fraction=p.height*(art.bounds.bottom-art.bounds.top)*focal/(camera.z-characterZ)/H;
  const feet=.5+(p.y+p.height*(p.footY-.5)-camera.y)*focal/(camera.z-characterZ)/H;
  if(t.engine===3)comp[slot].scaleGuide={adultHeight:resolved.height,groundY:ref.footY,footLine:feet,bodyFraction:0,referencePose:camera};
  results[slot]={reference:resolved.reference,candidates:resolved.candidates,bodyFraction:fraction,screenFootY:feet,environmentZ,characterZ};
 }
 cal.results={...cal.results,...results};delete comp.grounding.landmarkCalibration;
 fs.writeFileSync(file,JSON.stringify(pack,null,2)+'\n');if(!quiet)console.log(id,JSON.stringify(results,null,2));
 return results;
}
