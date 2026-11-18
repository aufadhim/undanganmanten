import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ease,panelEnvelope,createVisibleClock} from '../public/templates/shared/transition-motion.js';
import {createLandscapeWorld,sampleFlight} from '../public/templates/engines/landscape/world.js';
const root=new URL('../../',import.meta.url);
const registry=JSON.parse(fs.readFileSync(new URL('shared/template-registry.json',root)));
test('panel reveals have exact endpoints, monotonic opacity and a longer readable arrival',()=>{
 for(const duration of [180,1600,4000,7000]){
  assert.deepEqual(panelEnvelope(0,duration),{out:1,in:0});
  assert.deepEqual(panelEnvelope(1,duration),{out:0,in:1});
  let old={out:1,in:0};
  for(let i=1;i<=100;i++){const a=panelEnvelope(i/100,duration);assert.ok(a.out<=old.out&&a.in>=old.in);old=a}
  if(duration>=4000){assert.ok(panelEnvelope(.9,duration).in<.98);assert.ok(panelEnvelope(.8,duration).in>0)}
 }
 assert.equal(ease(-1),0);assert.equal(ease(2),1);
});
test('visible motion clock excludes hidden time and caps stalled frames',()=>{
 const c=createVisibleClock();assert.equal(c.step(100),0);assert.equal(c.step(116),16);
 c.step(120,true);assert.equal(c.step(90000),16);assert.equal(c.step(90016),32);
 assert.equal(c.step(100000),112);assert.equal(c.step(99999),112);
});
test('every landscape template has continuous forward/reverse journey endpoints on phone and desktop',()=>{
 let count=0;
 for(const t of registry.templates.filter(t=>t.engine===3)){
  const source=JSON.parse(fs.readFileSync(new URL(t.sceneSource,root)));
  const world=createLandscapeWorld(source.landscape,source.invitation.assets);
  for(const [w,h] of [[390,844],[1440,900]]){
   for(let i=1;i<world.stops.length;i++)for(const [a,b] of [[world.stops[i-1].id,world.stops[i].id],[world.stops[i].id,world.stops[i-1].id]]){
    const start=world.cameraFor(a,w,h),end=world.cameraFor(b,w,h),flight=world.planFlight(a,b,start,w,h);
    assert.deepEqual(sampleFlight(flight,0),start,t.id+': '+a);assert.deepEqual(sampleFlight(flight,1),end,t.id+': '+b);
    for(let p=0;p<=1;p+=.1)assert.ok(Object.values(sampleFlight(flight,p)).every(Number.isFinite),t.id);
   }
  }
  count++;
 }
 assert.equal(count,14);
});

test('character handoff uses projected screen geometry with matching endpoints',async()=>{
 const {projectedCharacter}=await import('../public/templates/shared/character-handoff.js');
 const scene={width:390,height:844,focal:1000,project:(x,y,z,p)=>[x-p.x,y-p.y,p.z-z]};
 const node={layer:{x:0,y:100,z:0,width:200,height:400}};
 assert.deepEqual(projectedCharacter(scene,node,{x:0,y:0,z:1000}),{x:195,y:522,width:200,height:400,angle:0});
 const far=projectedCharacter(scene,node,{x:0,y:0,z:2000});assert.equal(far.height,200);assert.equal(far.width,100);
});

test('all 40 Immersia templates share the same couple asset between cover and hero',()=>{
 const templates=registry.templates.filter(t=>[1,2,3].includes(t.engine));assert.equal(templates.length,40);
 for(const t of templates){const {invitation}=JSON.parse(fs.readFileSync(new URL(t.sceneSource,root)));assert.equal(invitation.assets.coverCouple,invitation.assets.heroCouple,t.id)}
});
