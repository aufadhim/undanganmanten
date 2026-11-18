import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePaintedHumanHeight,placePairInPainting} from '../public/templates/shared/painted-scale.js';
const art={aspect:.67,bounds:{left:.1,right:.9,top:.03,bottom:.96}};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} vs ${b}`);
test('a low-confidence oversized prop cannot determine human scale',()=>{
 const r=resolvePaintedHumanHeight({horizonY:.4,footY:.8,landmarks:[{id:'railing',height:.1,groundY:.6,metres:1,weight:.8},{id:'ambiguous-prop',height:.7,groundY:.6,metres:.1,weight:.2}]});
 assert.equal(r.reference,'railing');near(r.height,.336);
 assert.throws(()=>resolvePaintedHumanHeight({horizonY:.4,footY:.8,landmarks:[]}));
});
test('actual background depth preserves projected scale and foot contact across engines and painting sizes',()=>{
 for(const environmentZ of [-1600,-2200,-4000])for(const characterZ of [0,-1000])for(const size of [1000,2400,5000]){
  const camera={x:70,y:-20,z:1280},plane={x:150,y:120,width:size*1.5,height:size},humanHeight=.25,footY=.8;
  const p=placePairInPainting({art,plane,environmentZ,camera,characterZ,humanHeight,footX:.46,footY});
  const characterProjection=750/(camera.z-characterZ),backgroundProjection=750/(camera.z-environmentZ);
  near(p.height*(art.bounds.bottom-art.bounds.top)*characterProjection,plane.height*humanHeight*backgroundProjection);
  near((p.y+p.height*(p.footY-.5)-camera.y)*characterProjection,(plane.y+(footY-.5)*plane.height-camera.y)*backgroundProjection);
  near((p.x+((art.bounds.left+art.bounds.right)/2-.5)*p.width-camera.x)*characterProjection,(plane.x+(.46-.5)*plane.width-camera.x)*backgroundProjection);
 }
});
test('camera framing magnifies the painting and subject together when recalibrated',()=>{
 const plane={x:0,y:0,width:1200,height:1800};
 const heights=[1280,900].map(z=>{const camera={x:0,y:0,z},p=placePairInPainting({art,plane,environmentZ:-1600,camera,humanHeight:.25,footY:.8});return {human:p.height*.93*750/z,painting:1800*750/(z+1600)}});
 near(heights[0].human/heights[0].painting,heights[1].human/heights[1].painting);
});
