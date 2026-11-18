import test from 'node:test';
import assert from 'node:assert/strict';
// Controller integration with in-memory persistence only: no customer DB or storage calls.
const prisma={templateAvailability:{findUnique:async()=>null},invitation:{findFirst:async()=>null},uploadedAsset:{findMany:async()=>[]},illustrationRequest:{updateMany:async()=>{}},$transaction:async()=>{}};
globalThis.prisma=prisma;
const {applyThemePreset}=await import('../src/controllers/themeController.js');
function response(){return {code:200,status(code){this.code=code;return this},json(body){this.body=body;return this}}}
function setup(t,{fail=false,owner=true}={}){
 let saved={id:'invitation-test',userId:'owner-test',themeId:'garden-canvas',weddingId:null,themeSettings:{musicUrl:'/keep.mp3',characterSettings:{mode:'custom'}}};
 t.mock.method(prisma.templateAvailability,'findUnique',async()=>null);
 t.mock.method(prisma.invitation,'findFirst',async({where})=>{assert.equal(where.userId,'owner-test');assert.equal(where.id,'invitation-test');return owner?structuredClone(saved):null});
 t.mock.method(prisma.uploadedAsset,'findMany',async()=>[]);
 const approval=t.mock.method(prisma.illustrationRequest,'updateMany',async()=>assert.fail('Theme selection must not approve illustration uploads'));
 const transaction=t.mock.method(prisma,'$transaction',async fn=>{
  const draft=structuredClone(saved);
  const result=await fn({themeSettings:{upsert:async({update})=>{draft.themeSettings={...draft.themeSettings,...update}}},invitation:{update:async({data})=>{if(fail)throw Error('Simulated write failure');Object.assign(draft,data);return structuredClone(draft)}}});
  saved=draft;return result;
 });
 return {get saved(){return saved},transaction,approval};
}
const request=presetId=>({userId:'owner-test',headers:{'x-invitation-id':'invitation-test'},body:{invitationId:'invitation-test',presetId}});
test('all active theme changes return success after saving and preserve existing content',async t=>{
 const state=setup(t);
 for(const theme of ['garden-canvas','sekar-jawa','pramaya','riviera','wasesa','ludora','eternal','nawasena','seraya']){
  const res=response();await applyThemePreset(request(theme),res);
  assert.equal(res.code,200,JSON.stringify(res.body));assert.equal(res.body.invitation.themeId,theme);
  assert.equal(state.saved.themeId,theme);assert.equal(res.body.themeSettings.musicUrl,'/keep.mp3');assert.deepEqual(res.body.themeSettings.characterSettings,{mode:'custom'});
 }
 assert.equal(state.transaction.mock.calls.length,9);assert.equal(state.approval.mock.calls.length,0);
});
test('a failed theme write does not leave newly applied settings behind',async t=>{
 const state=setup(t,{fail:true}),before=structuredClone(state.saved),res=response();t.mock.method(console,'error',()=>{});await applyThemePreset(request('ludora'),res);assert.equal(res.code,500);assert.deepEqual(state.saved,before);
});
test('theme selection cannot update an invitation belonging to another user',async t=>{
 const state=setup(t,{owner:false}),res=response();await applyThemePreset(request('ludora'),res);assert.equal(res.code,404);assert.equal(state.transaction.mock.calls.length,0);
});
