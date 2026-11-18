import test from 'node:test';
import assert from 'node:assert/strict';
import {livestreamTarget} from '../src/utils/livestream.js';
test('only real YouTube hosts embed, including live URLs',()=>{
 const d=livestreamTarget('https://www.youtube.com/live/OyRjB-H2YJY');assert.match(d.embed,/embed\/OyRjB-H2YJY/);assert.ok(d.thumbnail);
 assert.equal(livestreamTarget('https://evil.com/youtube.com/watch?v=OyRjB-H2YJY').embed,'');
});
test('Zoom and Instagram remain external destinations',()=>{
 for(const url of ['https://zoom.us/j/123','https://instagram.com/account/live']){const d=livestreamTarget(url);assert.equal(d.embed,'');assert.equal(d.video,false);assert.equal(d.url,url)}
});
test('empty, malformed and unsafe links cannot activate a player',()=>{
 for(const s of ['', 'bad', 'javascript:alert(1)','data:text/html,hi'])assert.equal(livestreamTarget(s),null);
 assert.equal(livestreamTarget('https://example.com/stream.mp4?token=x').video,true);
});
