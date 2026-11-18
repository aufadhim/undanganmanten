import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../src/components/templates/nawasena/',import.meta.url);
const jsx=fs.readFileSync(new URL('NawasenaTemplate.jsx',root),'utf8');
const css=fs.readFileSync(new URL('nawasena.css',root),'utf8');
const bird=fs.readFileSync(new URL('Hummingbird.jsx',root),'utf8');
test('architecture has one opening plane, not two independently transformed copies',()=>{
 assert.equal((jsx.match(/className="nw-opening-mountains"/g)||[]).length,1); 
 assert.ok(!jsx.includes('nw-opening-joglo'));
});
test('hummingbird has articulated wings and container-relative travel',()=>{
 assert.ok(bird.includes('nw-wing-near')&&bird.includes('nw-wing-far'));
 assert.ok(!jsx.includes('ornamen-12.webp'));
 for(const name of ['nwHummingApproach','nwHummingReturn']){
  const frames=css.slice(css.indexOf('@keyframes '+name),css.indexOf('@keyframes '+name)+700);
  assert.ok(frames.includes('cqw'));
  assert.ok(!/\d(?:vw|vh)/.test(frames));
 }
});
test('hidden scenery pauses and opening is removed after transition',()=>{
 assert.ok(jsx.includes('setOpeningPresent(false)'));
 assert.ok(jsx.includes("document.addEventListener('visibilitychange',sync)"));
 assert.ok(css.includes('.nw-section:not(.nw-in-view)'));
 assert.ok(css.includes('.nawasena .nw-hummingbird{display:none}'));
});

test('cover choreography starts after image decoding, not on the open button',()=>{assert.ok(jsx.includes('setCoverReady(true)'));assert.ok(css.includes('.nw-opening.is-ready .nw-opening-mountains'));assert.ok(!jsx.includes('<NawasenaEntrance'));});
