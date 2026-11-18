import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {pageFit,ease,portalTransform,cameraFrame} from '../public/templates/engines/book/portal-math.js';
import config from '../src/components/templates/pramaya/defaultConfig.json' with {type:'json'};
import {createGardenPayload} from '../src/components/templates/viridarium/adapter.js';
import {mergeConfig} from '../public/templates/viridarium/config-store.js';
import {PRAMAYA_DEFAULT_SETTINGS} from '../src/config/themeCatalog.js';
import {getPresetById} from '../../backend/src/utils/themePresets.js';
test('Perspective portal preserves proportions and matches the interior viewport at both endpoints',()=>{
 for(const [w,h] of [[320,700],[390,844],[1440,900]]){
  const rect={left:w*.53,top:h*.4,width:w*.34,height:h*.2},g=pageFit(rect,w,h),end=cameraFrame(1,g);
  assert.ok(rect.width*end.scale>=w);assert.ok(rect.height*end.scale>=h);
  assert.ok(Math.abs((rect.width*end.scale)/(rect.height*end.scale)-rect.width/rect.height)<1e-8);
  assert.ok(Math.abs(end.x-(g.x-w/2))<1e-8);assert.ok(Math.abs(end.y-(g.y-h/2))<1e-8);
  assert.ok(Math.abs(rect.width*end.scale/end.uvX-w)<1e-8);
  assert.ok(Math.abs(rect.height*end.scale/end.uvY-h)<1e-8);
  for(const p of [0,.1,.25,.5,.75,1]){
   const f=cameraFrame(p,g);assert.ok(f.z>0);
   assert.ok(Math.abs((rect.width/f.uvX)/(rect.height/f.uvY)-w/h)<1e-8,'Page picture never stretches');
   assert.doesNotMatch(portalTransform(p,g),/scale\([^)]*,/,'Fallback also uses one scale');
  }
  assert.equal(cameraFrame(0,g).scale,1);assert.equal(ease(0),0);assert.equal(ease(1),1);
 }
 assert.throws(()=>pageFit({width:0,height:1},320,700),RangeError);
});
test('Pramaya uses independent book assets and preserves host data and validation',async()=>{
 const payload=createGardenPayload({coupleProfile:{brideName:'Sekar',groomName:'Jati'},themeSettings:PRAMAYA_DEFAULT_SETTINGS},null,true,config);
 assert.equal(payload.config.identity.title,'PRAMAYA');assert.equal(payload.config.identity.bride,'Sekar');
 assert.doesNotThrow(()=>mergeConfig(config,payload.config));assert.equal(new Set(config.sections.map(s=>s.room)).size,4);
 assert.deepEqual(PRAMAYA_DEFAULT_SETTINGS,getPresetById('pramaya').settings);
 for(const path of Object.values(config.assets))await access(new URL('../public/'+path.slice(1),import.meta.url));
});
