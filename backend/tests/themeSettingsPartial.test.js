import test from 'node:test';
import assert from 'node:assert/strict';
const prisma={invitation:{findFirst:async()=>null},themeSettings:{upsert:async()=>{}},illustrationRequest:{updateMany:async()=>{}}};
globalThis.prisma=prisma;
const {updateMyThemeSettings}=await import('../src/controllers/themeController.js');
const response=()=>({code:200,status(code){this.code=code;return this},json(body){this.body=body;return this}});
const current={background:{color:'#fff'},bodyText:{color:'#333'},button:{primary:'#777'},typography:{fontBody:'DM Sans'},brideBioEnabled:false};
function setup(t,settings=current){
 t.mock.method(prisma.invitation,'findFirst',async()=>({id:'invitation-test',themeSettings:structuredClone(settings)}));
 return t.mock.method(prisma.themeSettings,'upsert',async({update,create})=>{
  // Prisma validates required create data even when the row already exists.
  for(const key of ['background','bodyText','button','typography'])assert.notEqual(create[key],undefined);
  return {...settings,...update};
 });
}
const req=body=>({userId:'owner-test',headers:{'x-invitation-id':'invitation-test'},body});
test('a partial save supplies required creation fields without rewriting unchanged styling',async t=>{
 const write=setup(t),res=response();await updateMyThemeSettings(req({brideBioEnabled:true}),res);
 assert.equal(res.code,200);assert.equal(res.body.themeSettings.brideBioEnabled,true);
 assert.deepEqual(write.mock.calls[0].arguments[0].update,{brideBioEnabled:true});
 assert.deepEqual(res.body.themeSettings.typography,current.typography);
});
test('unchanged settings skip the database write',async t=>{
 const write=setup(t),res=response();await updateMyThemeSettings(req({brideBioEnabled:false}),res);
 assert.equal(res.code,200);assert.equal(write.mock.calls.length,0);
});
