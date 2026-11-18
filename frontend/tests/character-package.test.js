import {resolveImageUrl} from '../src/config/env.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {createGardenPayload} from '../src/components/templates/viridarium/adapter.js';
import defaults from '../src/components/templates/viridarium/defaultConfig.json' with {type:'json'};
const point={scale:1.2,x:20,y:10,aspect:.6};
test('one character can serve both scenes while retaining a fixed foot position',()=>{
 const payload=createGardenPayload({themeSettings:{coverImageUrl:'https://example.test/couple.webp',characterSettings:{mode:'custom',separatePose:false,cover:point,hero:point}}});
 assert.equal(payload.config.assets.coverCouple,payload.config.assets.heroCouple);
 for(const side of ['cover','hero']){const layout=payload.config.layout;assert.equal(layout[side+'Width'],defaults.layout[side+'Width']*1.5*1.2*.6);const foot=layout[side+'Y']+layout[side+'Width']/.6/2;assert.ok(Math.abs(foot-(defaults.layout[side+'Y']+defaults.layout[side+'Width']*.75+10))<.001)}
});
test('default character ignores retained custom art but supports placement',()=>{const config=createGardenPayload({themeSettings:{coverImageUrl:'https://example.test/couple.webp',characterSettings:{mode:'default',separatePose:false,cover:point,hero:point}}}).config;assert.notEqual(config.assets.coverCouple,'https://example.test/couple.webp');assert.equal(config.layout.coverWidth,defaults.layout.coverWidth*point.scale);assert.equal(config.layout.coverX,defaults.layout.coverX+point.x);assert.equal(config.layout.heroWidth,defaults.layout.heroWidth*point.scale)});
test('head calibration changes profile camera without altering other scenes',()=>{const settings={mode:'custom',separatePose:false,cover:{...point,anchors:{bride:{x:.8,y:.4},groom:{x:.2,y:.2}}},hero:point};const config=createGardenPayload({themeSettings:{characterSettings:settings}}).config;assert.notDeepEqual(config.cameras.find(c=>c.id==='wanita'),defaults.cameras.find(c=>c.id==='wanita'));assert.deepEqual(config.cameras.find(c=>c.id==='akad'),defaults.cameras.find(c=>c.id==='akad'))});

test('profile field names produce active Instagram links, parent titles, and bio',()=>{
 const p=createGardenPayload({coupleProfile:{brideName:'A',brideFullName:'A Lengkap',brideIg:' @ddarmd ',groomIg:'instagram.com/auf',brideFather:'Dwipa',brideMother:'Ibu Juni',groomFather:'Bapak Palal',groomMother:'Supiyah',brideBio:'Profil yang ditulis sendiri.'},themeSettings:{brideBioEnabled:true}});
 assert.equal(p.config.links.brideInstagram,'https://www.instagram.com/ddarmd/');assert.equal(p.config.links.groomInstagram,'https://instagram.com/auf');assert.equal(p.config.copy.t057.value,'');assert.equal(p.config.copy.t052.value,'Bapak Dwipa');assert.equal(p.config.copy.t054.value,'Ibu Juni');assert.equal(p.config.copy.t064.value,'Bapak Palal');assert.equal(p.config.copy.t066.value,'Ibu Supiyah');assert.equal(p.profiles.brideBio,'Profil yang ditulis sendiri.');
 assert.equal(createGardenPayload({coupleProfile:{brideBio:'Disembunyikan'},themeSettings:{brideBioEnabled:false}}).profiles.brideBio,'');
});
test('second illustration falls back to first until an inside illustration exists',()=>{
 const a=createGardenPayload({themeSettings:{coverImageUrl:'https://example.test/one.webp',characterSettings:{mode:'custom',separatePose:true,cover:{scale:1,x:0,y:0},hero:{scale:1,x:0,y:0}}}});assert.equal(a.config.assets.heroCouple,a.config.assets.coverCouple);
 const b=createGardenPayload({themeSettings:{characterSettings:{mode:'default'}},characterRenderAssets:{coverCouple:'data:image/webp;base64,AAAA'}});assert.notEqual(b.config.assets.coverCouple,'data:image/webp;base64,AAAA');
});
test('wide poses fit inside the stage bounds without stretching or clipping',()=>{const point={scale:1,x:0,y:0,aspect:1.2};const a=createGardenPayload({themeSettings:{characterSettings:{mode:'custom',separatePose:false,cover:point,hero:point}}}).config;assert.ok(a.layout.coverWidth<=defaults.layout.coverWidth);assert.ok(a.layout.coverWidth/1.2<=defaults.layout.coverWidth*1.5);assert.ok(Math.abs(a.layout.coverY+a.layout.coverWidth/1.2/2-(defaults.layout.coverY+defaults.layout.coverWidth*.75))<.001)});

test('sandbox illustration thumbnails keep their local data URLs and bundled template paths',()=>{const inline='data:image/webp;base64,AAAA';assert.equal(resolveImageUrl(inline),inline);assert.equal(resolveImageUrl('/templates/wasesa/assets/landscape-joglo.webp'),'/templates/wasesa/assets/landscape-joglo.webp');assert.equal(resolveImageUrl('https://assets.test/couple.webp'),'https://assets.test/couple.webp');assert.ok(!resolveImageUrl('/uploads/photo.webp').startsWith('/uploads/'));});
