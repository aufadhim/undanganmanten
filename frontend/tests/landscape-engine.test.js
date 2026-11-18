import {createGardenPayload} from '../src/components/templates/viridarium/adapter.js';
import {mergeConfig} from '../public/templates/viridarium/config-store.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createLandscapeWorld,sampleFlight,viewportLens,validateLandscape,validateLoadedArt} from '../public/templates/engines/landscape/world.js';
import {createJourneyRoute} from '../public/templates/shared/journey-route.js';
import config from '../src/components/templates/riviera/defaultConfig.json' with {type:'json'};
import definition from '../public/templates/riviera/landscape.json' with {type:'json'};
const landscape=createLandscapeWorld(definition,config.assets);
const viewports=[[320,932],[360,640],[390,844],[768,1024],[1440,900],[2560,1080]];
function inside(p,w,h){const distance=p.z-definition.world.z,lens=viewportLens(w,h);assert.ok(Math.abs(p.x)+w/2*distance/lens<definition.world.width/2,`horizontal world edge ${w}x${h}`);assert.ok(Math.abs(p.y-(definition.world.y||0))+h/2*distance/lens<definition.world.height/2,`vertical world edge ${w}x${h}`)}
test('all scenic areas remain in one fixed world, with static feathered joins and independent foregrounds',()=>{const layers=landscape.layers(config.layout);assert.equal(layers.filter(l=>l.id.startsWith('landscape-area-')).length,4);assert.ok(layers.every(l=>!l.room&&!l.fit));assert.ok(layers.filter(l=>l.slot).every(l=>l.preserveAspect));for(const a of definition.areas){assert.ok(config.assets[a.asset]);assert.ok(a.feather>0)}assert.ok(Math.abs(landscape.cameraFor('penutup',390,844).x-landscape.cameraFor('cover',390,844).x)>24000);});
test('resting and panoramic cameras do not expose world edges on phones or desktop',()=>{for(const [w,h]of viewports)for(const stop of definition.stops)for(const overview of [false,true])inside(landscape.cameraFor(stop.id,w,h,{overview}),w,h);});
test('a landmark fits fully inside portrait and desktop viewports rather than being cropped',()=>{for(const [w,h]of viewports)for(const stop of definition.stops){if(stop.fit!=='landmark')continue;const area=definition.areas.find(a=>a.id===stop.area),p=landscape.cameraFor(stop.id,w,h),lens=viewportLens(w,h),distance=p.z-definition.world.z,halfW=w/2*distance/lens,halfH=h/2*distance/lens,cx=area.x+(area.landmark.x-.5)*area.width,cy=(area.y||0)+(area.landmark.y-.5)*area.height;assert.ok(Math.abs(cx-p.x)+area.landmark.width*area.width/2<=halfW,`${stop.id} width on ${w}`);assert.ok(Math.abs(cy-p.y)+area.landmark.height*area.height/2<=halfH,`${stop.id} height on ${w}`)}});
test('cross-area journeys retreat to overviews, pause for scenery, then approach the reading pose',()=>{const from=landscape.cameraFor('pria',390,844),to=landscape.cameraFor('countdown',390,844),flight=landscape.planFlight('pria','countdown',from,390,844);assert.ok(flight.keys.length>=6);assert.ok(flight.keys[1].pose.z>from.z);assert.ok(flight.keys.some((key,i)=>i&&JSON.stringify(key.pose)===JSON.stringify(flight.keys[i-1].pose)));assert.deepEqual(sampleFlight(flight,0),from);assert.deepEqual(sampleFlight(flight,1),to);});
test('long jumps and reverse journeys visit intermediate scenery continuously and stay inside the painting',()=>{for(const [fromId,toId]of [['cover','penutup'],['penutup','cover'],['galeri','janji'],['wanita','pria']]){const from=landscape.cameraFor(fromId,390,844),flight=landscape.planFlight(fromId,toId,from,390,844);assert.deepEqual(sampleFlight(flight,0),from);assert.deepEqual(sampleFlight(flight,1),landscape.cameraFor(toId,390,844));for(let p=0;p<=1;p+=.005){const pose=sampleFlight(flight,p);assert.ok(Object.values(pose).every(Number.isFinite));inside(pose,390,844)}}});
test('reduced motion skips scenic zooms while preserving exact endpoints',()=>{const from=landscape.cameraFor('cover',390,844),flight=landscape.planFlight('cover','penutup',from,390,844,{reduced:true});assert.equal(flight.duration,180);assert.equal(flight.keys.length,2);assert.deepEqual(sampleFlight(flight,1,true),landscape.cameraFor('penutup',390,844));});
test('section reorder changes itinerary, not the physical position of a landmark',()=>{const ids=definition.stops.slice(1).map(s=>s.id),before=landscape.cameraFor('galeri',390,844),route=createJourneyRoute(ids,[{id:'gallery',enabled:true},{id:'story',enabled:true}],new Set(['filter']));assert.ok(!route.includes('filter'));assert.ok(route.indexOf('galeri')<route.indexOf('cerita'));assert.deepEqual(landscape.cameraFor('galeri',390,844),before);});
test('a different theme can rename areas and replace art without changing the engine',()=>{const other=structuredClone(definition),names=['orchard','stream','pavilion','terrace'],mapping=Object.fromEntries(other.areas.map((a,i)=>[a.id,names[i]]));other.areas.forEach(a=>a.id=mapping[a.id]);other.stops.forEach(s=>s.area=mapping[s.area]);other.decorations.forEach(d=>d.area=mapping[d.area]);other.id='another-theme';const world=createLandscapeWorld(other,config.assets);assert.equal(world.definition.id,'another-theme');assert.equal(world.areas[0].id,'orchard');assert.deepEqual(world.cameraFor('cerita',390,844),landscape.cameraFor('cerita',390,844));});
test('invalid maps fail before rendering',()=>{for(const mutate of [d=>d.stops[1].id='cover',d=>d.stops[1].area='missing',d=>d.areas[0].landmark.width=-1,d=>d.areas[0].asset='missing',d=>d.world.width=0]){const d=structuredClone(definition);mutate(d);assert.throws(()=>validateLandscape(d,config.assets),/Landscape:/)}});
test('Riviera is selectable, content packs stay synchronized, and local art files exist',async()=>{const {THEME_CATALOG}=await import('../src/config/themeCatalog.js');const{THEME_DEFAULT_SETTINGS}=await import('../src/config/themePresets.js');const{getPresetById}=await import('../../backend/src/utils/themePresets.js');const{normalizeActiveThemeId}=await import('../src/utils/activeTheme.js');const{createGardenPayload}=await import('../src/components/templates/viridarium/adapter.js');const{mergeConfig}=await import('../public/templates/viridarium/config-store.js');assert.ok(THEME_CATALOG.some(t=>t.id==='riviera'));assert.equal(normalizeActiveThemeId('riviera'),'riviera');assert.deepEqual(THEME_DEFAULT_SETTINGS.riviera,getPresetById('riviera').settings);const payload=createGardenPayload({coupleProfile:{brideName:'Nara',groomName:'Bima'}},null,true,config);assert.equal(payload.config.identity.bride,'Nara');assert.doesNotThrow(()=>mergeConfig(config,payload.config));assert.deepEqual(JSON.parse(readFileSync(new URL('../public/templates/riviera/config/invitation.json',import.meta.url))),config);for(const area of definition.areas)assert.ok(readFileSync(new URL('../public'+config.assets[area.asset],import.meta.url)).length>1000);});

test('image aspect validation rejects a landscape file replaced with an incompatible portrait',()=>{const nodes=[{layer:{id:'landscape-underpainting'},img:{naturalWidth:1200,naturalHeight:400}},...definition.areas.map(a=>({layer:{id:'landscape-area-'+a.id},img:{naturalWidth:1024,naturalHeight:1024}}))];assert.doesNotThrow(()=>validateLoadedArt(definition,nodes));nodes[1].img.naturalWidth=600;assert.throws(()=>validateLoadedArt(definition,nodes),/rasio gambar/)});
test('future landscape theme asset folders are accepted while traversal stays blocked',async()=>{const {mergeConfig}=await import('../public/templates/viridarium/config-store.js');const alternate=structuredClone(config);alternate.assets.landscapeGarden='/templates/kebun-baru/assets/meadow.webp';assert.doesNotThrow(()=>mergeConfig(config,alternate));alternate.assets.landscapeGarden='/templates/kebun-baru/assets/../private.webp';assert.throws(()=>mergeConfig(config,alternate),/Sumber aset/)});

test('engine 3 slows reading transitions while explicit and reduced durations remain predictable',()=>{const from=landscape.cameraFor('hero',390,844);assert.ok(landscape.planFlight('hero','janji',from,390,844).duration>=3600);assert.equal(landscape.planFlight('hero','janji',from,390,844,{duration:5100}).duration,5100);assert.equal(landscape.planFlight('hero','janji',from,390,844,{reduced:true}).duration,180);const d=structuredClone(definition);d.motion.durationScale=.5;const fast=createLandscapeWorld(d,config.assets),start=landscape.cameraFor('pria',390,844);assert.ok(landscape.planFlight('pria','countdown',start,390,844).duration>fast.planFlight('pria','countdown',start,390,844).duration);});
test('Wasesa uses the shared landscape engine, synchronized packs, and matching frontend/backend presets',async()=>{const d=JSON.parse(readFileSync(new URL('../public/templates/wasesa/landscape.json',import.meta.url))),c=JSON.parse(readFileSync(new URL('../src/components/templates/wasesa/defaultConfig.json',import.meta.url)));assert.deepEqual(c,JSON.parse(readFileSync(new URL('../public/templates/wasesa/config/invitation.json',import.meta.url))));const{THEME_DEFAULT_SETTINGS}=await import('../src/config/themePresets.js');const{getPresetById}=await import('../../backend/src/utils/themePresets.js');assert.deepEqual(THEME_DEFAULT_SETTINGS.wasesa,getPresetById('wasesa').settings);const world=createLandscapeWorld(d,c.assets);for(const a of d.areas)assert.ok(readFileSync(new URL('../public'+c.assets[a.asset],import.meta.url)).length>1000);for(const [w,h]of viewports)for(const stop of d.stops){const p=world.cameraFor(stop.id,w,h),dist=p.z-d.world.z,lens=viewportLens(w,h);assert.ok(Math.abs(p.x)+w/2*dist/lens<d.world.width/2);assert.ok(Math.abs(p.y-(d.world.y||0))+h/2*dist/lens<d.world.height/2);if(stop.fit==='landmark'){const a=d.areas.find(a=>a.id===stop.area),cx=a.x+(a.landmark.x-.5)*a.width,cy=(a.y||0)+(a.landmark.y-.5)*a.height;assert.ok(Math.abs(cx-p.x)+a.landmark.width*a.width/2<=w/2*dist/lens);assert.ok(Math.abs(cy-p.y)+a.landmark.height*a.height/2<=h/2*dist/lens)}}});

test('sandbox custom art and independent character positions reach both landscape templates',()=>{
 for(const theme of ['riviera','wasesa']){
  const pack=JSON.parse(readFileSync(new URL(`../src/components/templates/${theme}/defaultConfig.json`,import.meta.url)));
  const image='data:image/webp;base64,AAAA';
  const payload=createGardenPayload({id:'sandbox',themeSettings:{coverImageUrl:image,characterSettings:{mode:'custom',separatePose:false,cover:{scale:.8,x:35,y:20,aspect:.6},hero:{scale:1.1,x:-25,y:50,aspect:.6}}}},null,true,pack);
  assert.equal(payload.config.assets.coverCouple,image);assert.equal(payload.config.assets.heroCouple,image);
  assert.notEqual(payload.config.layout.coverX,payload.config.layout.heroX);
  assert.doesNotThrow(()=>mergeConfig(pack,payload.config));
 }
});

test('all three Immersia engines use the full month name in their closing date',()=>{
 for(const theme of ['viridarium','sekar-jawa','pramaya','riviera','wasesa']){
  const source=JSON.parse(readFileSync(new URL(`../src/components/templates/${theme}/defaultConfig.json`,import.meta.url))),published=JSON.parse(readFileSync(new URL(`../public/templates/${theme}/config/invitation.json`,import.meta.url)));
  assert.equal(source.copy.t216.value.trim(),'{{monthName}}',theme);assert.deepEqual(source,published,theme);
 }
});

test('return to cover takes one fast continuous flight instead of the scenic itinerary',()=>{
 const from=landscape.cameraFor('penutup',390,844),flight=landscape.planFlight('penutup','cover',from,390,844,{duration:1600,direct:true});
 assert.equal(flight.duration,1600);assert.equal(flight.keys.length,2);assert.deepEqual(sampleFlight(flight,0),from);assert.deepEqual(sampleFlight(flight,1),landscape.cameraFor('cover',390,844));
 for(let p=0;p<=1;p+=.01)inside(sampleFlight(flight,p),390,844);
 assert.equal(landscape.planFlight('penutup','cover',from,390,844,{duration:1600,direct:true,reduced:true}).duration,180);
});

test('Ludora is offered end to end with a synchronized playful landscape and editable characters',async()=>{
 const d=JSON.parse(readFileSync(new URL('../public/templates/ludora/landscape.json',import.meta.url))),c=JSON.parse(readFileSync(new URL('../src/components/templates/ludora/defaultConfig.json',import.meta.url)));
 const {THEME_CATALOG}=await import('../src/config/themeCatalog.js');const {THEME_DEFAULT_SETTINGS}=await import('../src/config/themePresets.js');const {getPresetById}=await import('../../backend/src/utils/themePresets.js');const {normalizeActiveThemeId}=await import('../src/utils/activeTheme.js');
 assert.ok(THEME_CATALOG.some(t=>t.id==='ludora'&&t.category==='Immersia'));assert.equal(normalizeActiveThemeId('ludora'),'ludora');assert.deepEqual(THEME_DEFAULT_SETTINGS.ludora,getPresetById('ludora').settings);
 assert.deepEqual(c,JSON.parse(readFileSync(new URL('../public/templates/ludora/config/invitation.json',import.meta.url))));assert.deepEqual(d.areas.map(a=>a.id),['meadow','plaza','picnic','party']);
 for(const key of [d.world.asset,...d.areas.map(a=>a.asset),'coverCouple','heroCouple','riverbank'])assert.ok(readFileSync(new URL('../public'+c.assets[key],import.meta.url)).length>1000);
 const payload=createGardenPayload({themeId:'ludora',coupleProfile:{brideName:'Nara',groomName:'Bima'},themeSettings:{characterSettings:{mode:'default',cover:{scale:1.1,x:20,y:10},hero:{scale:1,x:0,y:0}}}},null,true,c);
 assert.doesNotThrow(()=>mergeConfig(c,payload.config));assert.equal(payload.config.identity.bride,'Nara');assert.equal(payload.config.layout.coverX,20);assert.notEqual(payload.config.layout.coverWidth,c.layout.coverWidth);assert.equal(payload.config.assets.coverCouple,c.assets.coverCouple);
 const world=createLandscapeWorld(d,c.assets);for(const [w,h]of viewports)for(const stop of d.stops){const p=world.cameraFor(stop.id,w,h),lens=viewportLens(w,h),dist=p.z-d.world.z;assert.ok(Math.abs(p.x)+w/2*dist/lens<d.world.width/2);assert.ok(Math.abs(p.y-(d.world.y||0))+h/2*dist/lens<d.world.height/2)}
 const from=world.cameraFor('hero',390,844),flight=world.planFlight('hero','penutup',from,390,844);assert.ok(flight.keys.length>6);assert.deepEqual(sampleFlight(flight,1),world.cameraFor('penutup',390,844));assert.equal(c.copy.t218.value,'Kembali ke sampul');
});

test('Ludora keeps people and props in a consistent perspective during scenic zooms',()=>{
 const d=JSON.parse(readFileSync(new URL('../public/templates/ludora/landscape.json',import.meta.url))),c=JSON.parse(readFileSync(new URL('../src/components/templates/ludora/defaultConfig.json',import.meta.url))),world=createLandscapeWorld(d,c.assets);
 const ratio=z=>(z-d.world.z)/(z-d.characters.hero.z);
 const close=world.cameraFor('hero',390,844),wide=world.cameraFor('hero',390,844,{overview:true});
 assert.ok(Math.abs(ratio(close.z)/ratio(wide.z)-1)<.15,'people must not shrink faster than scenery during retreat');
 // The painted hat occupies about 8% of its square area width. A standing person must be much taller.
 const p=world.cameraFor('penutup',390,844),human=(c.layout.heroWidth*c.layout.closingScale*1.5*.9)/(p.z-d.characters.closing.z),hat=(d.areas[3].width*.08)/(p.z-d.world.z);
 assert.ok(human/hat>3.5,'picnic props must remain small relative to an adult');
 const bicycleHeight=d.areas[3].height*.16/(p.z-d.world.z);
 assert.ok(human/bicycleHeight>1.8,'adult height must substantially exceed a bicycle at the picnic plane');
 const oldPose=world.characterPose('closing',{...c.layout,closingWidth:1125},1.5),newPose=world.characterPose('closing',{...c.layout,closingWidth:c.layout.heroWidth*c.layout.closingScale},1.5);
 assert.equal(oldPose.y+oldPose.height/2,newPose.y+newPose.height/2,'resizing must preserve ground contact');
 assert.equal(world.layers(c.layout).find(l=>l.id==='landscape-underpainting').y,d.world.y);
 for(const [w,h]of viewports)for(const from of ['cover','penutup']){const to=from==='cover'?'penutup':'cover',flight=world.planFlight(from,to,world.cameraFor(from,w,h),w,h);for(let t=0;t<=1;t+=.02){const p=sampleFlight(flight,t),lens=viewportLens(w,h),distance=p.z-d.world.z;assert.ok(Math.abs(p.x)+w/2*distance/lens<d.world.width/2);assert.ok(Math.abs(p.y-d.world.y)+h/2*distance/lens<d.world.height/2)}}
 assert.notEqual(c.assets.coverCouple,c.assets.heroCouple);assert.match(c.assets.coverCouple,/sampul-v2/);assert.match(c.assets.heroCouple,/hero-v2/);
});

test('all long-landscape couples keep adult scale and depth relative to scenery',()=>{
 for(const theme of ['riviera','wasesa','ludora']){
  const d=JSON.parse(readFileSync(new URL(`../public/templates/${theme}/landscape.json`,import.meta.url))),c=JSON.parse(readFileSync(new URL(`../src/components/templates/${theme}/defaultConfig.json`,import.meta.url))),world=createLandscapeWorld(d,c.assets);
  for(const slot of ['cover','hero','closing']){
   const a=d.characters[slot],stop=a.stop,area=d.areas.find(a=>a.id===d.stops.find(s=>s.id===stop).area);
   const width=slot==='closing'?c.layout.heroWidth*c.layout.closingScale:c.layout[slot+'Width'];
   const relative=p=>width*1.5/(p.z-a.z)/(area.width/(p.z-d.world.z));
   for(const[w,h]of viewports){
    const near=world.cameraFor(stop,w,h),far=world.cameraFor(stop,w,h,{overview:true});
    assert.ok(Math.abs(relative(near)/relative(far)-1)<.15,`${theme} ${slot}: relative scale drifts during retreat`);
    assert.ok(relative(near)>.2,`${theme} ${slot}: people too small beside paving and plants`);
   }
  }
  assert.ok(d.decorations.filter(n=>n.attachment).every(n=>n.attachment.contact),'contact must inherit the pair plane');
 }
});

test('profile framing preserves head to feet after live size, position and reversed poses',()=>{
 for(const [w,h]of viewports)for(const reversed of [false,true])for(const id of ['wanita','pria']){
  const layout={...config.layout,heroWidth:1700,heroX:145,heroY:580,heroBrideHeadX:reversed?.24:.72,heroBrideHeadY:.25,heroGroomHeadX:reversed?.72:.24,heroGroomHeadY:.13};
  const pair=landscape.characterPose('hero',layout,1.8),camera=landscape.profileCamera(id,w,h,layout,1.8),lens=viewportLens(w,h),distance=camera.z-pair.z;
  const x=who=>w/2+(pair.x+(layout['hero'+who+'HeadX']-.5)*pair.width-camera.x)*lens/distance;
  const selected=id==='wanita'?'Bride':'Groom',other=id==='wanita'?'Groom':'Bride',sx=x(selected),ox=x(other);
  assert.ok(sx>w*.04&&sx<w*.96);
  const top=h/2+(pair.y-pair.height/2-camera.y)*lens/distance,bottom=h/2+(pair.y+pair.height/2-camera.y)*lens/distance;
  assert.ok(top>=h*.1&&bottom<=h*.9,`full body visible on ${w}x${h}`);
  const sy=h/2+(pair.y+(layout['hero'+selected+'HeadY']-.5)*pair.height-camera.y)*lens/distance;
  assert.ok(sy>0&&sy<h);assert.ok(Object.values(camera).every(Number.isFinite));
 }
});

test('head markers survive full configuration merge for every landscape pack',()=>{
 for(const theme of ['riviera','wasesa','ludora']){
  const pack=JSON.parse(readFileSync(new URL(`../src/components/templates/${theme}/defaultConfig.json`,import.meta.url)));
  const settings={mode:'custom',separatePose:true,hero:{scale:1.1,x:80,y:20,aspect:.7,anchors:{bride:{x:.81,y:.29},groom:{x:.24,y:.18}}}};
  const payload=createGardenPayload({themeSettings:{characterSettings:settings}},undefined,true,pack);
  const merged=mergeConfig(pack,payload.config);
  assert.equal(merged.layout.heroBrideHeadX,.81);assert.equal(merged.layout.heroBrideHeadY,.29);
  assert.equal(merged.layout.heroGroomHeadX,.24);assert.equal(merged.layout.heroGroomHeadY,.18);
 }
});

