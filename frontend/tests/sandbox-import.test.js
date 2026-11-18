import test from 'node:test';
import assert from 'node:assert/strict';
import {importSandboxOnce} from '../src/utils/sandboxImport.js';
function setup(){const data=new Map([['sandbox_invitation',JSON.stringify({themeId:'garden-canvas',coupleProfile:{brideName:'A'},weddingDate:'2027-01-01'})]]);const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};let posts=0,fail=false;const api={post:async()=>{posts++;return {data:{invitation:{id:'saved'}}}},patch:async()=>{if(fail)throw Error('offline')}};return {storage,api,supportedThemes:['garden-canvas'],get posts(){return posts},set fail(v){fail=v}}}
test('ordinary login never imports a saved sandbox draft',async()=>{const f=setup();assert.equal(await importSandboxOnce(f),false);assert.equal(f.posts,0);assert.ok(f.storage.getItem('sandbox_invitation'))});
test('concurrent mounts share one import',async()=>{const f=setup();f.storage.setItem('sandbox_import_requested','true');const a=importSandboxOnce(f),b=importSandboxOnce(f);assert.equal(a,b);await a;assert.equal(f.posts,1);assert.equal(f.storage.getItem('sandbox_invitation'),null)});
test('failed import keeps draft and resumes existing invitation on explicit retry',async()=>{const f=setup();f.fail=true;f.storage.setItem('sandbox_import_requested','true');await assert.rejects(importSandboxOnce(f));await Promise.resolve();assert.ok(f.storage.getItem('sandbox_invitation'));f.fail=false;f.storage.setItem('sandbox_import_requested','true');await importSandboxOnce(f);assert.equal(f.posts,1)});

test('sandbox illustration import uploads once, resumes after a failed save, and keeps the chosen landscape theme',async()=>{
 const image='data:image/webp;base64,AAAA',draft=JSON.stringify({themeId:'wasesa',themeSettings:{coverImageUrl:image,coverSecondImageUrl:image,characterSettings:{mode:'custom'}}});
 const values=new Map([['sandbox_invitation',draft],['sandbox_import_requested','true']]),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 let creates=0,uploads=0,fail=true,saved;
 const api={post:async(path,body)=>{if(path==='/invitations'){creates++;assert.equal(body.themeId,'wasesa');return{data:{invitation:{id:'wasesa-draft'}}}}uploads++;assert.equal(body.get('invitationId'),'wasesa-draft');return{data:{url:'https://assets.test/couple.webp'}}},patch:async(path,body)=>{if(path==='/invitations/me/theme'){saved=body;if(fail)throw Error('offline')}}};
 await assert.rejects(importSandboxOnce({storage,api,supportedThemes:['wasesa','riviera']}));await Promise.resolve();assert.equal(uploads,1);assert.equal(saved.coverImageUrl,'https://assets.test/couple.webp');assert.equal(saved.coverSecondImageUrl,saved.coverImageUrl);
 fail=false;storage.setItem('sandbox_import_requested','true');await importSandboxOnce({storage,api,supportedThemes:['wasesa','riviera']});assert.equal(creates,1);assert.equal(uploads,1);assert.equal(storage.getItem('sandbox_invitation'),null);
});
