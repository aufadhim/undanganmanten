import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {stagePack,openingPath,restPose,closingPose,mixPose} from '../public/templates/cover-stage/stage-pack.js';
import config from '../src/components/templates/sekar-jawa/defaultConfig.json' with {type:'json'};
import garden from '../src/components/templates/viridarium/defaultConfig.json' with {type:'json'};
import {mergeConfig} from '../public/templates/viridarium/config-store.js';
test('Cover stage layers have independent depth and valid reusable resources',async()=>{
 const before=JSON.stringify(config),pack=stagePack(config,'data:image/png;base64,AA==');
 assert.equal(pack.layers.length,9);assert.equal(new Set(pack.layers.map(l=>l.z)).size,9);
 assert.ok(pack.layers.some(l=>l.id==='stage-pillar'));assert.ok(pack.layers.some(l=>l.id==='stage-pair'));assert.ok(pack.layers.find(l=>l.id==='stage-ground').ground);assert.equal(pack.layers.find(l=>l.id==='stage-pillar').anchor,'bottom');assert.ok(pack.layers.find(l=>l.id==='stage-pillar').x<0);
 for(const layer of pack.layers)if(layer.src.startsWith('/templates/'))await access(new URL('../public'+layer.src,import.meta.url));
 assert.doesNotThrow(()=>mergeConfig(config,config));assert.equal(JSON.stringify(config),before);
 assert.equal(garden.assets.stageArch,undefined,'Anam keeps its current opening');
});
test('Camera paths have valid near planes, continuous interpolation and stable endpoints',()=>{
 assert.ok(openingPath.at(-1).t<=6);assert.deepEqual(mixPose(restPose,closingPose,0),restPose);assert.deepEqual(mixPose(restPose,closingPose,1),closingPose);
 for(let i=0;i<openingPath.length-1;i++)for(let p=0;p<=1;p+=.05){const pose=mixPose(openingPath[i],openingPath[i+1],p);for(const n of Object.values(pose))assert.ok(Number.isFinite(n));assert.ok(pose.z>850,'Camera remains in front of the nearest foreground plane');}
});
