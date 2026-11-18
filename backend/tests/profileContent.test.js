import test from 'node:test';
import assert from 'node:assert/strict';
const prisma={$transaction:async()=>{}};
globalThis.prisma=prisma;
const {saveProfileContent}=await import('../src/controllers/coupleProfileController.js');
const response=()=>({code:200,status(code){this.code=code;return this},json(body){this.body=body;return this}});
const request=(body={profile:{brideName:'New name'},themeSettings:{brideBioEnabled:true}})=>({userId:'owner',headers:{'x-invitation-id':'inv'},body});
function setup(t,{fail=false,owner=true}={}){
 let saved={profile:{brideName:'Original',groomName:'Groom'},theme:{background:{},bodyText:{},button:{},typography:{},brideBioEnabled:false}};
 let approvals=0;
 t.mock.method(prisma,'$transaction',async fn=>{
  const draft=structuredClone(saved);
  const result=await fn({
   invitation:{findFirst:async({where})=>{assert.deepEqual(where,{id:'inv',userId:'owner'});return owner?{id:'inv',themeSettings:draft.theme}:null}},
   coupleProfile:{upsert:async({update})=>{Object.assign(draft.profile,update);return draft.profile}},
   themeSettings:{upsert:async({update,create})=>{for(const key of ['background','bodyText','button','typography'])assert.notEqual(create[key],undefined);if(fail)throw Error('Simulated settings failure');Object.assign(draft.theme,update);return draft.theme}},
   illustrationRequest:{updateMany:async()=>{approvals++;return {count:0}}},
  });
  saved=draft;return result;
 });
 return {get saved(){return saved},get approvals(){return approvals}};
}
test('profile and settings are committed together',async t=>{
 const state=setup(t),res=response();await saveProfileContent(request(),res);
 assert.equal(res.code,200);assert.equal(state.saved.profile.brideName,'New name');assert.equal(state.saved.theme.brideBioEnabled,true);
 assert.equal(res.body.coupleProfile.brideName,'New name');assert.equal(res.body.themeSettings.brideBioEnabled,true);
});
test('settings failure rolls back the profile too',async t=>{
 const state=setup(t,{fail:true}),before=structuredClone(state.saved),res=response();t.mock.method(console,'error',()=>{});
 await saveProfileContent(request(),res);assert.equal(res.code,500);assert.deepEqual(state.saved,before);
});
test('invalid settings are rejected before starting a transaction',async t=>{
 const transaction=t.mock.method(prisma,'$transaction',async()=>assert.fail('Must not write'));
 const res=response();await saveProfileContent(request({profile:{brideName:'New name'},themeSettings:{characterSettings:{mode:'invalid'}}}),res);
 assert.equal(res.code,400);assert.equal(transaction.mock.calls.length,0);
});
test('another owner cannot save profile content',async t=>{
 const state=setup(t,{owner:false}),before=structuredClone(state.saved),res=response();await saveProfileContent(request(),res);
 assert.equal(res.code,404);assert.deepEqual(state.saved,before);
});
