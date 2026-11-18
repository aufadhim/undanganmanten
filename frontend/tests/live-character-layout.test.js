import test from 'node:test';
import assert from 'node:assert/strict';
import {updateCharacterLayout} from '../public/templates/shared/live-character-layout.js';
test('placement updates existing planes, keeps proportions and independent scene positions',()=>{
 const make=(y)=>({nodes:[{layer:{id:'couple',y},img:{naturalWidth:500,naturalHeight:1000}},{layer:{id:'contact-shadow'}}]});
 const host={coverScene:make(470),heroScene:make(300)},cover=host.coverScene.nodes[0];
 const initial={coverY:400,heroY:300};
 const next={coverWidth:200,coverX:40,coverY:450,heroWidth:300,heroX:-20,heroY:320};
 updateCharacterLayout(host,next,initial);
 assert.equal(host.coverScene.nodes[0],cover);
 assert.deepEqual([cover.layer.width,cover.layer.height,cover.layer.x,cover.layer.y],[200,400,40,520]);
 assert.equal(host.heroScene.nodes[0].layer.y,320);
 assert.equal(host.coverScene.nodes[1].layer.y,708);
 updateCharacterLayout(host,{...next,coverY:460},next);
 assert.equal(cover.layer.y,530);
 assert.equal(host.heroScene.nodes[0].layer.x,-20);
});
test('closing scene is preserved while editing inside placement',()=>{
 const host={InvitationStage:{outside:true},coverScene:{nodes:[{layer:{id:'couple',y:100}}]}};
 updateCharacterLayout(host,{coverWidth:200,coverX:0,coverY:200},{});
 assert.equal(host.coverScene.nodes[0].layer.y,100);
});

test('contact shadow follows decoded feet, scale, depth and visibility through camera moves',async()=>{
 const{syncContactShadow,groundedCenter}=await import('../public/templates/shared/character-grounding.js');
 const shadow={layer:{},opacity:1};
 for(const width of [280,600,1450])for(const aspect of [1.2,1.5,2]){
  const height=width*aspect,pair={layer:{x:75,y:groundedCenter(400,600,width,aspect),z:-1800,width,height},opacity:.4};
  syncContactShadow(pair,shadow);
  assert.equal(shadow.layer.x,75);assert.equal(shadow.layer.y,pair.layer.y+height/2-12);
  assert.equal(shadow.layer.z,-1802);assert.ok(Math.abs(shadow.opacity-.3)<1e-12);
  for(const camera of [1120,1660,5000]){
   const foot=(pair.layer.y+height/2)*750/(camera-pair.layer.z),contact=shadow.layer.y*750/(camera-shadow.layer.z);
   assert.ok(Math.abs(foot-contact)<5,'contact must not detach when camera zooms');
  }
  assert.equal(pair.layer.y+height/2,400+600*aspect/2,'resize keeps foot line');
 }
});
