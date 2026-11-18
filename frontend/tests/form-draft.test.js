import test from 'node:test';
import assert from 'node:assert/strict';
import {readFormDraft,writeFormDraft} from '../src/hooks/useFormDraft.js';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}};
test('pristine and successfully saved values do not leave a stale draft',()=>{
 const storage=memory(),original={name:'Original'},changed={name:'Changed'};
 writeFormDraft(storage,'a',original,JSON.stringify(original));assert.equal(storage.getItem('a'),null);
 writeFormDraft(storage,'a',changed,JSON.stringify(original));assert.deepEqual(readFormDraft(storage,'a',original),changed);
 writeFormDraft(storage,'a',changed,JSON.stringify(changed));assert.equal(storage.getItem('a'),null);
 assert.deepEqual(readFormDraft(storage,'a',{name:'Fresh server value'}),{name:'Fresh server value'});
});
test('unsaved changes survive reload and stay separate for each invitation',()=>{
 const storage=memory();storage.setItem('a',JSON.stringify({name:'Draft'}));
 assert.deepEqual(readFormDraft(storage,'a',{name:'Saved',newField:true}),{name:'Draft',newField:true});
 assert.deepEqual(readFormDraft(storage,'b',{name:'Other invitation'}),{name:'Other invitation'});
});
test('malformed drafts safely fall back to saved values',()=>{
 const storage=memory();storage.setItem('a','{bad');assert.deepEqual(readFormDraft(storage,'a',{name:'Saved'}),{name:'Saved'});
});
