import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ivoryWashBounds,unionReadingRects} from '../public/templates/shared/ivory-wash.js';
const root=new URL('../../',import.meta.url),registry=JSON.parse(fs.readFileSync(new URL('shared/template-registry.json',root)));
test('reading bounds omit empty panel space and clip scrolling content to the visible surface',()=>{
 const clip={left:10,top:20,width:360,height:600};
 const rect=unionReadingRects([{left:55,top:50,width:240,height:30},{left:70,top:100,width:200,height:40},{left:40,top:700,width:300,height:40}],clip);
 assert.deepEqual(rect,{left:55,top:50,width:240,height:90});
 const bed=ivoryWashBounds(rect);assert.equal(bed.width,272);assert.equal(bed.height,130);assert.ok(bed.width<clip.width);assert.ok(bed.height<clip.height/2);
 assert.deepEqual(unionReadingRects([{left:0,top:0,width:50,height:40}],clip),{left:10,top:20,width:40,height:20});
 assert.equal(unionReadingRects([],clip),null);
});
test('all 40 Immersia templates load one canonical wash after local visual overrides',()=>{
 const templates=registry.templates.filter(t=>t.engine);assert.equal(templates.length,40);
 for(const t of templates){const html=fs.readFileSync(new URL(`frontend/public/templates/${t.folder}/index.html`,root),'utf8'),links=[...html.matchAll(/<link[^>]+>/g)].map(m=>m[0]).filter(l=>/stylesheet/i.test(l));
  assert.equal(links.filter(l=>l.includes('/shared/ivory-wash.css')).length,1,t.id);
  assert.ok(links.at(-1).includes('/shared/ivory-wash.css'),t.id+' final cascade');
 }
});
const linear=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};
const luminance=c=>c.map(linear).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
test('canonical text ink has at least 4.5:1 contrast on the dense ivory core over a black illustration',()=>{
 const surface=[255,251,241].map(v=>v*.80);
 for(const t of registry.templates.filter(t=>t.engine)){
  const {invitation:c}=JSON.parse(fs.readFileSync(new URL(t.sceneSource,root))),ink=c.style.ink.match(/[a-f\d]{2}/gi).map(h=>parseInt(h,16));
  const contrast=(luminance(surface)+.05)/(luminance(ink.map((v,i)=>v*.94+[30,39,29][i]*.06))+.05);assert.ok(contrast>=4.5,t.id+': '+contrast);
 }
});
