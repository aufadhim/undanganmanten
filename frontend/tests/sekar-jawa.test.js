import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import scenePack from '../src/components/templates/sekar-jawa/defaultConfig.json' with {type:'json'};
import anam from '../src/components/templates/viridarium/defaultConfig.json' with {type:'json'};
import {createGardenPayload} from '../src/components/templates/viridarium/adapter.js';
import {mergeConfig} from '../public/templates/viridarium/config-store.js';
import {SEKAR_DEFAULT_SETTINGS,THEME_CATALOG} from '../src/config/themeCatalog.js';
import {THEME_DEFAULT_SETTINGS} from '../src/config/themePresets.js';
import {getPresetById} from '../../backend/src/utils/themePresets.js';
import {normalizeActiveThemeId} from '../src/utils/activeTheme.js';

test('Sekar has a separate four-room art pack without changing Anam',()=>{
 const before=JSON.stringify(anam),payload=createGardenPayload({coupleProfile:{brideName:'Sekar',groomName:'Jati'},themeSettings:SEKAR_DEFAULT_SETTINGS},null,true,scenePack);
 assert.equal(payload.config.identity.title,'SOGAN');assert.equal(payload.config.identity.bride,'Sekar');
 assert.equal(new Set(payload.config.sections.map(s=>s.room)).size,4);
 assert.match(payload.config.assets.room1,/sekar-jawa\/assets\/regol-garden/);
 assert.match(payload.config.assets.coverCouple,/couple-cover/);assert.match(payload.config.assets.heroCouple,/couple-hero/);
 assert.doesNotThrow(()=>mergeConfig(scenePack,payload.config));assert.equal(JSON.stringify(anam),before);
});
test('Sekar is selectable and frontend/backend palettes agree',()=>{
 assert.ok(THEME_CATALOG.find(t=>t.id==='sekar-jawa'));
 assert.equal(normalizeActiveThemeId('sekar-jawa'),'sekar-jawa');
 assert.deepEqual(THEME_DEFAULT_SETTINGS['sekar-jawa'],getPresetById('sekar-jawa').settings);
});
test('All Sekar resources exist and manual CSS is independent of Anam',async()=>{
 const root=new URL('../public/',import.meta.url);
 for(const src of Object.values(scenePack.assets)){
  if(src.startsWith('/templates/'))await access(new URL(src.slice(1),root));
 }
 const html=await readFile(new URL('templates/sekar-jawa/index.html',root),'utf8');
 assert.match(html,/href="custom.css"/);assert.doesNotMatch(html,/viridarium\/custom.css/);
 assert.match(html,/viridarium\/bootstrap.js/);
});
