import {test} from 'node:test';
import assert from 'node:assert/strict';
import {plannerInviteContext} from '../src/utils/plannerInviteContext.js';

test('partner invitation survives login and signup navigation',()=>{
 const token='ab'.repeat(32);
 const context=plannerInviteContext('?plannerInvite='+token);
 assert.equal(context.returnPath,'/planner/invite/'+token);
 assert.equal(plannerInviteContext(context.query).returnPath,context.returnPath);
});
test('login destination cannot be overridden with external or arbitrary paths',()=>{
 for(const value of ['', '?plannerInvite=https://example.com', '?plannerInvite=//example.com', '?plannerInvite=/admin', '?plannerInvite='+('a'.repeat(64))+'%2fextra']){
  assert.deepEqual(plannerInviteContext(value),{returnPath:'',query:''});
 }
});
