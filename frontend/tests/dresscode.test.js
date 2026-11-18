import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDresscode} from '../src/utils/dresscode.js';
test('legacy dress codes retain categories and colors',()=>{
 const d=normalizeDresscode(JSON.stringify({title:'Batik',items:[{title:'Pria',desc:'Lengan panjang',colors:['#aabbcc']},{title:'Wanita',colors:['#ddeeff']}]}));
 assert.equal(d.mode,'separate');assert.equal(d.items[0].desc,'Lengan panjang');assert.deepEqual(d.items[1].colors,['#ddeeff']);
});
test('legacy flat palette, invalid colors and optional labels remain safe',()=>{
 const d=normalizeDresscode([{color:'#ffffff',label:'Ivory'},{color:'bad',label:'Bad'}]);
 assert.equal(d.mode,'shared');assert.deepEqual(d.items[0].colors,['#ffffff']);assert.equal(d.items[0].colorLabels[0],'Ivory');
 assert.equal(normalizeDresscode('invalid','Batik').title,'Batik');
});
test('shared instructions and note survive normalization',()=>{
 const d=normalizeDresscode({mode:'shared',title:'Batik',note:'Hindari putih',items:[{title:'Semua tamu',colors:[],desc:''}]});
 assert.equal(d.note,'Hindari putih');assert.deepEqual(d.items[0].colors,[]);
});
