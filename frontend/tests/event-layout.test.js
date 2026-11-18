import test from 'node:test';import assert from 'node:assert/strict';
import {sameEventLocation,eventTitle} from '../public/templates/shared/event-layout.js';
const first={venueName:'Rumah Mempelai Wanita',address:'Gang Salak',googleMapsUrl:'https://maps.app.goo.gl/AbC',startTime:'07:30'};
test('shared venue is deduplicated despite different times and text spacing',()=>{assert.equal(sameEventLocation([first,{...first,venueName:' rumah mempelai wanita ',startTime:'13:00'}]),true)});
test('different venue, address or maps remain separate',()=>{for(const key of ['venueName','address','googleMapsUrl'])assert.equal(sameEventLocation([first,{...first,[key]:'different'}]),false);assert.equal(sameEventLocation([{},{}]),false);assert.equal(sameEventLocation([first]),false)});
test('event subtitles use proper labels for legacy and current event types',()=>{assert.equal(eventTitle('akad'),'Akad');assert.equal(eventTitle('CEREMONY'),'Akad');assert.equal(eventTitle('resepsi'),'Resepsi');assert.equal(eventTitle('RECEPTION'),'Resepsi')});
import {eventPanelScale} from '../public/templates/shared/event-panel-fit.js';
test('event panel fits short phones without clipping its last action',()=>{
 for(const [width,height] of [[320,568],[390,844],[768,1024]])for(const contentHeight of [420,760,1200]){
  const scale=eventPanelScale(contentHeight,width-36,height,width);
  assert.ok(scale<=1&&scale>0);
  assert.ok(contentHeight*scale<=height-164+.01);
 }
});
