import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../../',import.meta.url);
const registry=JSON.parse(fs.readFileSync(new URL('shared/template-registry.json',root)));
test('all engine 1/2 templates retain the four room backgrounds even when initially invisible',async()=>{
 const oldWindow=globalThis.window,oldLocation=globalThis.location;
 try{
  for(const template of registry.templates.filter(t=>[1,2].includes(t.engine))){
   const config=JSON.parse(fs.readFileSync(new URL(template.sceneSource,root))).invitation;
   // A disabled foreground must be removed, while initially hidden rooms stay available.
   config.composition??={};config.composition.hero??={};config.composition.hero.foreground={opacity:0};
   globalThis.window={InvitationConfig:config};globalThis.location={pathname:`/templates/${template.folder}/index.html`};
   const engine=template.engine===1?'rooms':'book';
   const module=await import(`../public/templates/engines/${engine}/garden-theme.js?audit=${template.id}`);
   const layers=module.heroLayers(),rooms=layers.filter(l=>l.room);
   assert.deepEqual(rooms.map(l=>l.room),[1,2,3,4],template.id);
   assert.deepEqual(rooms.map(l=>l.opacity),[1,0,0,0],template.id);
   assert.equal(layers.some(l=>l.id==='canopy'),false,template.id);
   for(const room of rooms){
    const asset=room.src.startsWith('/')?new URL('frontend/public'+room.src,root):new URL('frontend/public/templates/viridarium/'+room.src,root);
    assert.ok(fs.existsSync(asset),`${template.id}: missing ${room.src}`);
   }
  }
 }finally{globalThis.window=oldWindow;globalThis.location=oldLocation}
});
