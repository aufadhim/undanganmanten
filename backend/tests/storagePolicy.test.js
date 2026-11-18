import test from 'node:test';import assert from 'node:assert/strict';
import {uploadBudget,INVITATION_BYTES,ACCOUNT_BYTES,stringsIn} from '../src/utils/storagePolicy.js';
test('storage allowance counts exact post-compression bytes',()=>{assert.equal(uploadBudget(ACCOUNT_BYTES-1,0,1),null);assert.match(uploadBudget(ACCOUNT_BYTES,0,1),/150 MB/);assert.match(uploadBudget(0,INVITATION_BYTES,1),/50 MB/)});
test('reference scan includes nested theme and gallery URLs without dates',()=>{assert.deepEqual([...stringsIn({theme:{a:'image.webp',list:[{url:'song.mp3'}]},date:new Date()})],['image.webp','song.mp3'])});
