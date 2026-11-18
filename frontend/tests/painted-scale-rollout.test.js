import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createLandscapeWorld,viewportLens} from '../public/templates/engines/landscape/world.js';
const root=new URL('../../',import.meta.url),registry=JSON.parse(fs.readFileSync(new URL('shared/template-registry.json',root))),H=844,W=390,focal=viewportLens(W,H);
test('all 120 placements have authored scale references, visible feet and centred body bounds',()=>{
 let n=0;
 for(const t of registry.templates.filter(t=>t.engine)){
  const pack=JSON.parse(fs.readFileSync(new URL(t.sceneSource,root))),c=pack.invitation,cal=c.composition.grounding.paintingScale;
  assert.ok(cal,t.id);const world=t.engine===3?createLandscapeWorld(pack.landscape,c.assets):null;
  for(const slot of ['cover','hero','closing']){
   const ref=cal.scenes[slot],result=cal.results[slot],art=c.composition.art[slot==='closing'?'hero':slot];
   assert.ok(ref.landmarks.length&&result.candidates.length,t.id+' '+slot);
   assert.ok(result.bodyFraction>.20&&result.bodyFraction<.6,t.id+' '+slot+' framing');
   assert.ok(result.screenFootY>.70&&result.screenFootY<.97,t.id+' '+slot+' feet');
   let camera= c.composition[slot].scaleGuide.referencePose,x=c.layout[slot+'X'];
   if(world){const ch=pack.landscape.characters[slot],s=pack.landscape.stops.find(s=>s.id===ch.stop),a=pack.landscape.areas.find(a=>a.id===s.area);camera=world.cameraFor(s.id,W,H);x+=a.x+(s.x||0);}
   assert.ok(Math.abs(x+((art.bounds.left+art.bounds.right)/2-.5)*c.layout[slot+'Width']-camera.x)<1e-7,t.id+' '+slot+' centre');
   const visibleHeight=c.layout[slot+'Width']/art.aspect*(art.bounds.bottom-art.bounds.top);
   assert.ok(Math.abs(visibleHeight*focal/(camera.z-result.characterZ)/H-result.bodyFraction)<1e-7,t.id+' '+slot+' projected size');
   const asset=c.assets[ref.asset],file=asset.startsWith('/')?'frontend/public'+asset:'frontend/public/templates/viridarium/'+asset;
   assert.ok(fs.existsSync(new URL(file,root)),t.id+' '+slot+' source painting');n++;
  }
 }
 assert.equal(n,120);
});
test('Swarnalaya uses a smaller courtyard cover scale and preserves the hero and closing',()=>{
 const {invitation:c}=JSON.parse(fs.readFileSync(new URL('shared/template-scenes/melayu-balairung.json',root))),r=c.composition.grounding.paintingScale.results;
 assert.equal(r.cover.reference, "courtyard-railing"); assert.ok(r.cover.bodyFraction > .37 && r.cover.bodyFraction < .39);assert.ok(Math.abs(r.hero.bodyFraction-.3552)<1e-8);
 assert.equal(r.closing.environmentZ,-2200);
});
