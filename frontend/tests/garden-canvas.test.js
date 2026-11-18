import test from 'node:test';
import assert from 'node:assert/strict';
import {createGardenPayload} from '../src/components/templates/viridarium/adapter.js';
import {mergeConfig} from '../public/templates/viridarium/config-store.js';
import defaults from '../src/components/templates/viridarium/defaultConfig.json' with {type:'json'};
import {THEME_CATALOG} from '../src/config/themeCatalog.js';

test('Garden Canvas maps real invitation data instead of demo names and dates',()=>{
 const payload=createGardenPayload({coupleProfile:{brideName:'Nara',groomName:'Bima',brideFather:'Ayah Nara'},events:[{date:'2027-04-10',startTime:'09:30',venueName:'Taman Kita'}],quoteSettings:{customText:'Janji kami',customSource:'Keluarga'},themeSettings:{coverImageUrl:'/uploads/couple.webp'},galleryMedia:[{type:'video',url:'/uploads/video.mp4'}]}, {name:'Tamu Kita'}, true);
 assert.equal(payload.config.identity.bride,'Nara');assert.equal(payload.config.copy.t052.value,'Ayah Nara');assert.equal(payload.config.copy.t043.value,'Janji kami');assert.equal(payload.config.copy.t044.value,'Keluarga');assert.equal(payload.config.event.start,'2027-04-10T02:30:00.000Z');assert.equal(payload.guest.name,'Tamu Kita');assert.equal(payload.gallery.length,1);
 assert.equal(payload.config.assets.coverCouple,'http://localhost:4000/uploads/couple.webp');
 assert.doesNotThrow(()=>mergeConfig(defaults,payload.config));
});
test('Empty invitation yields a valid scene pack with safe dates and four rooms',()=>{
 const payload=createGardenPayload({weddingDate:'invalid',coupleProfile:null,themeSettings:null});
 assert.doesNotThrow(()=>mergeConfig(defaults,payload.config));assert.equal(new Set(payload.config.sections.map(s=>s.room)).size,4);assert.equal(payload.events.length,0);assert.equal(payload.config.sections.length,15);
});
test('New catalog preserves accepted themes and offers both four-room templates',()=>{
 assert.deepEqual(THEME_CATALOG.map(t=>t.id),['ludora','wasesa','riviera','pramaya','garden-canvas','sekar-jawa','eternal','nawasena','seraya']);
});
