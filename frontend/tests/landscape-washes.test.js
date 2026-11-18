import test from 'node:test';import assert from 'node:assert/strict';
import {attachReadingWashes} from '../public/templates/engines/landscape/reading-washes.js';
import {attachClouds,paintCloud} from '../public/templates/shared/runtime/cloud-backdrops.js';
function harness(){
 const keys=['document','ResizeObserver','MutationObserver','addEventListener','requestAnimationFrame','NodeFilter','getComputedStyle'],saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const beds=[],resizes=[];let box={left:22,top:110,width:346,height:390};
 const panel={hidden:false,getBoundingClientRect:()=>box,querySelectorAll:()=>[],addEventListener(){}};
 const text={textContent:'Visible reading copy',parentElement:{closest:()=>null}};
 globalThis.document={createElement:()=>({style:{setProperty(k,v){this[k]=v}},dataset:{},setAttribute(){}}),querySelector:()=>({append:n=>beds.push(n)}),createTreeWalker:()=>{let used=false;return{nextNode:()=>used?null:(used=true,text)}},createRange:()=>({selectNodeContents(){},getClientRects:()=>[box]})};
 globalThis.NodeFilter={SHOW_TEXT:4};globalThis.getComputedStyle=()=>({display:'block',visibility:'visible'});
 globalThis.ResizeObserver=class{constructor(cb){resizes.push(cb)}observe(){}};globalThis.MutationObserver=class{observe(){}};
 globalThis.requestAnimationFrame=cb=>{cb();return 0};globalThis.addEventListener=()=>{};
 return {beds,resizes,panel,setBox(value){box=value},restore(){Object.assign(globalThis,saved)}};
}
test('landscape pigment follows content, visibility, reveal opacity and resize',()=>{
 const h=harness();try{
  const paint=attachReadingWashes(new Map([['hero',h.panel],['wanita',h.panel]]));assert.equal(h.beds.length,1);const bed=h.beds[0];
  paint('wanita',1);assert.equal(bed.hidden,false);assert.equal(bed.style.left,'195px');assert.equal(bed.style.top,'305px');
  h.setBox({left:40,top:70,width:350,height:610});h.resizes[0]();assert.equal(bed.style.left,'215px');assert.equal(bed.style.top,'375px');
  paint('wanita',.4);assert.equal(bed.style.opacity,'0.4');paint('wanita',0);assert.equal(bed.hidden,true);
 }finally{h.restore()}
});
test('rooms and landscape use identical compact content bounds',()=>{
 const h=harness();try{
  attachClouds([{id:'hero'},{id:'janji'}],[null,h.panel]);const paint=attachReadingWashes(new Map([['janji',h.panel]]));
  for(const rect of [{left:22,top:110,width:346,height:390},{left:40,top:90,width:250,height:580}]){
   h.setBox(rect);for(const fit of h.resizes)fit();paintCloud(1,1);paint('janji',1);
   for(const key of ['left','top','width','height'])assert.equal(h.beds[0].style[key],h.beds[1].style[key]);
   assert.ok(parseFloat(h.beds[0].style.width)-rect.width<=32);assert.ok(parseFloat(h.beds[0].style.height)-rect.height<=40);
  }
  paintCloud(1,0);paint('janji',0);assert.ok(h.beds.every(b=>b.hidden));
 }finally{h.restore()}
});
