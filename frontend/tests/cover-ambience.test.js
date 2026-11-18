import test from 'node:test';import assert from 'node:assert/strict';
import {COVER_AMBIENCE_THEMES,coverAmbienceProfile,ambientParticles,mountCoverAmbience} from '../public/templates/shared/cover-ambience.js';
import {coverCameraPose} from '../public/templates/engines/landscape/cover-motion.js';
function fixture(){
 const events=new Map(),docEvents=new Map(),nodes=[];let loaded;
 const ready=new Promise(resolve=>loaded=resolve);
 const classes=()=>{const values=new Set();return{add:(...v)=>v.forEach(x=>values.add(x)),remove:(...v)=>v.forEach(x=>values.delete(x)),contains:v=>values.has(v),toggle:(v,on)=>{if(on)values.add(v);else values.delete(v)}}};
 const el=()=>({className:'',classList:classes(),dataset:{},style:{setProperty(){}},children:[],setAttribute(){},append(n){this.children.push(n)},remove(){this.removed=true}});
 const win={addEventListener:(k,fn)=>events.set(k,fn),removeEventListener:k=>events.delete(k),dispatchEvent:e=>events.get(e.type)?.(e),CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},MutationObserver:class{observe(){}disconnect(){}},Image:class{decode(){return Promise.resolve()}},setTimeout:fn=>setTimeout(fn,0)};
 const doc={hidden:false,defaultView:win,fonts:{ready:Promise.resolve()},querySelector:()=>({sheet:{}}),createElement:()=>{const n=el();nodes.push(n);return n},addEventListener:(k,fn)=>docEvents.set(k,fn),removeEventListener:k=>docEvents.delete(k)};
 const host=el(),copy=el();host.ownerDocument=doc;host.querySelectorAll=()=>[copy];return{host,copy,doc,events,docEvents,ready,loaded,nodes};
}
test('active catalogue themes have distinct cover direction and preserve already-rich Nawasena',()=>{
 assert.equal(Object.keys(COVER_AMBIENCE_THEMES).length,9);assert.equal(coverAmbienceProfile('nawasena').existing,true);assert.equal(coverAmbienceProfile('viridarium'),coverAmbienceProfile('garden-canvas'));assert.equal(coverAmbienceProfile('missing'),null);
 assert.equal(coverAmbienceProfile('ludora').bubbles,14);
 assert.notEqual(coverAmbienceProfile('seraya').skin,coverAmbienceProfile('wasesa').skin);assert.equal(coverAmbienceProfile('wasesa').fliers,null);
 const particles=ambientParticles(20);assert.deepEqual(particles,ambientParticles(20));assert.ok(particles.every(p=>p.x>=0&&p.x<100&&p.duration>=15&&p.size<=9));
});
test('cover waits for primary assets, starts on activation, pauses offscreen and cleans up on unmount',async()=>{
 const f=fixture(),controller=mountCoverAmbience(f.host,{theme:'riviera',ready:f.ready,active:false}),root=f.host.children[0];
 assert.equal(f.host.classList.contains('live-cover-ready'),false);f.loaded();await controller.ready;assert.equal(f.host.classList.contains('live-cover-ready'),false);
 controller.setActive(true);assert.equal(f.host.classList.contains('live-cover-ready'),true);assert.equal(root.classList.contains('is-paused'),false);
 f.doc.hidden=true;f.docEvents.get('visibilitychange')();assert.equal(root.classList.contains('is-paused'),true);
 f.doc.hidden=false;f.events.get('invitation:opened')();assert.equal(root.classList.contains('is-dormant'),true);f.events.get('invitation:closed')();assert.equal(root.classList.contains('is-dormant'),false);
 controller.destroy();assert.equal(root.removed,true);assert.equal(f.host.classList.contains('live-cover-ready'),false);assert.equal(f.events.size,0);assert.equal(f.docEvents.size,0);
});
test('late image completion cannot resurrect an unmounted cover',async()=>{
 const f=fixture(),controller=mountCoverAmbience(f.host,{theme:'eternal',ready:f.ready});controller.destroy();f.loaded();await controller.ready;assert.equal(f.host.classList.contains('live-cover-ready'),false);
});
test('landscape cover establishes once, keeps camera continuous and respects reduced motion',()=>{
 const base={x:-12000,y:80,z:1700,roll:0,yaw:0,pitch:0},start=coverCameraPose(base,0),rest=coverCameraPose(base,6);
 assert.ok(start.z<base.z);assert.ok(Math.abs(rest.x-base.x)<15);assert.deepEqual(coverCameraPose(base,0,{motion:false}),base);
 assert.ok(Math.abs(coverCameraPose(base,6.001).z-rest.z)<.1);assert.ok(Math.abs(coverCameraPose(base,0,{intro:false}).z-base.z)<10);assert.equal(base.z,1700);
});
