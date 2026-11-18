import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {environmentPlane,placeCharacter,groundedCenter,syncContactShadow,humanHeightAtGround} from '../public/templates/shared/character-grounding.js';
import {createLandscapeWorld,viewportLens} from '../public/templates/engines/landscape/world.js';
const root=new URL('../../',import.meta.url),registry=JSON.parse(fs.readFileSync(new URL('shared/template-registry.json',root))),H=844,W=390,lens=viewportLens(W,H);
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-6,`${label}: ${a} vs ${b}`);
test('authored pairs follow measured art references or legacy screen targets, with feet on the calibrated floor',()=>{
 let checked=0;
 for(const t of registry.templates.filter(t=>t.engine)){
  const {invitation:c,landscape:m}=JSON.parse(fs.readFileSync(new URL(t.sceneSource,root)));
  assert.equal(c.composition.grounding.version,5,t.id);
  const art=c.composition.art.hero,b=art.bounds;
  const world=m?createLandscapeWorld(m,c.assets):null;
  for(const [slot,fraction]of [['cover',.43],['hero',.48],['closing',.40]]){
   const guide=c.composition[slot].scaleGuide;
   let camera=guide.referencePose,z=0,pair={width:c.layout[slot+'Width'],y:c.layout[slot+'Y']};
   if(world){const character=m.characters[slot];camera=world.cameraFor(character.stop,W,H);pair=world.characterPose(slot,c.layout,1/art.aspect);z=pair.z;}
   const height=pair.width/art.aspect,distance=camera.z-z;
   const expected=c.composition.grounding.paintingScale?.results?.[slot]?.bodyFraction??c.composition.grounding.landmarkCalibration?.references?.[slot]?.measuredBodyFraction??fraction;
   near(height*(b.bottom-b.top)*lens/distance/H,expected,t.id+' '+slot+' body');
   near(.5+(pair.y+height*(b.bottom-.5)-camera.y)*lens/distance/H,guide.footLine,t.id+' '+slot+' feet');
   assert.ok(guide.footLine>.65&&guide.footLine<.98,t.id+' visible feet');
   assert.equal(c.layout[slot+'FootY'],b.bottom,t.id+' uses same illustration foot bounds');
  }
  checked++;
 }
 assert.equal(checked,40);
});
test('Swarnalaya stair reference scales with floor depth, rather than a fixed screen percentage',()=>{
 const reference={riserHeight:.013,riserGroundY:.71,horizonY:.52,groundY:.71};
 near(humanHeightAtGround(reference),.013*(1.68/.16),'adult height at measured stair');
 near(humanHeightAtGround({...reference,groundY:.90}),2*humanHeightAtGround(reference),'twice the distance below horizon');
 assert.throws(()=>humanHeightAtGround({...reference,riserGroundY:.52}));
 const {invitation:c}=JSON.parse(fs.readFileSync(new URL('shared/template-scenes/melayu-balairung.json',root)));
 assert.ok(c.composition.grounding.paintingScale.results.hero.bodyFraction<.4);
});
test('environment stays fixed in scene space when the camera moves',()=>{
 const g={bodyFraction:.48,adultHeight:.43,groundY:.72,footLine:.83,referencePose:{x:0,y:0,z:1280}};
 const a=environmentPlane(g,{width:390,height:844,focal:750,aspect:1,z:-1600});
 const b=environmentPlane(g,{width:390,height:844,focal:750,aspect:1,z:-1600});
 assert.deepEqual(a,b);assert.ok(a.height>0);
 const screenHeight=z=>a.height*750/(z+1600);
 assert.ok(screenHeight(1600)<screenHeight(1280),'A camera retreat changes apparent scale instead of resizing the painting');
});
test('resize preserves visible foot contact, including transparent image margins',()=>{
 for(const footY of [.88,.95,1])for(const factor of [.6,1,1.8]){
  const baseWidth=400,width=baseWidth*factor,aspect=1.5,y=groundedCenter(100,baseWidth,width,aspect,0,footY);
  near(y+width*aspect*(footY-.5),100+baseWidth*aspect*(footY-.5),'foot position');
  const pair={layer:{x:15,y,width,height:width*aspect,footY,z:-1800},opacity:.8},shadow={layer:{}};
  syncContactShadow(pair,shadow);near(shadow.layer.y,pair.layer.y+pair.layer.height*(footY-.5)-width*.008,'contact shadow');assert.equal(shadow.layer.z,-1802);
 }
});

test('painted planes cover the viewport around their actual floor anchor',()=>{
 for(const t of registry.templates.filter(t=>t.engine&&t.engine!==3)){
  const {invitation:c}=JSON.parse(fs.readFileSync(new URL(t.sceneSource,root)));
  for(const slot of ['cover','hero','closing']){
   const g=c.composition[slot].scaleGuide,p=g.referencePose;
   for(const aspect of [.66,1,1.5]){
    const plane=environmentPlane(g,{width:W,height:H,focal:lens,aspect,z:-1600}),scale=lens/(p.z+1600);
    const top=H/2+(plane.y-plane.height/2-p.y)*scale,bottom=top+plane.height*scale;
    assert.ok(top<0&&bottom>H,t.id+' '+slot+' vertical coverage');
    assert.ok(plane.width*scale>W,t.id+' '+slot+' horizontal coverage');
    near(H/2+(plane.y+(g.groundY-.5)*plane.height-p.y)*scale,g.footLine*H,t.id+' floor contact');
   }
  }
 }
});
