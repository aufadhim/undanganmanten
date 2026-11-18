import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureIllustrationQuota} from '../src/services/illustrationQuota.js';
function db(initial,used=0){let wallet=initial;return {illustrationWallet:{findUnique:async()=>wallet,upsert:async({create,update})=>wallet=wallet?{...wallet,...update}:create},illustrationGeneration:{count:async()=>used}}}
test('new invitation receives three uses without admin or payment',async()=>{const tx=db(null);assert.equal((await ensureIllustrationQuota(tx,'new')).remaining,3)});
test('legacy inactive balance receives only unused allowance',async()=>{const tx=db({granted:0,remaining:0},2);assert.equal((await ensureIllustrationQuota(tx,'legacy')).remaining,1)});
test('repeated reads never refill exhausted quota',async()=>{const tx=db({granted:3,remaining:0},3);for(let i=0;i<3;i++)assert.equal((await ensureIllustrationQuota(tx,'used')).remaining,0)});
test('missing wallet cannot erase recorded use',async()=>{assert.equal((await ensureIllustrationQuota(db(null,4),'used')).remaining,0)});
