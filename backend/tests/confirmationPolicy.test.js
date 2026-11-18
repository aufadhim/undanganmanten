import test from 'node:test';import assert from 'node:assert/strict';import{confirmationPolicy}from'../src/utils/confirmationPolicy.js';
const inv={invitationFeatures:{rsvpEnabled:true,wishesEnabled:true}},body={name:'Tamu',attending:true,guestCount:2,message:'Selamat!'};
test('attendance must be explicitly chosen',()=>assert.equal(confirmationPolicy(inv,{...body,attending:undefined}).status,400));
test('declining always produces zero guests regardless of stale count',()=>assert.equal(confirmationPolicy(inv,{...body,attending:false,guestCount:2}).guestCount,0));
test('invalid wish rejects the entire confirmation plan before writes',()=>assert.equal(confirmationPolicy(inv,{...body,message:'bangsat'}).status,400));
test('disabled RSVP permits wishes without attendance or count',()=>{const d=confirmationPolicy({invitationFeatures:{rsvpEnabled:false,wishesEnabled:true}},{name:'Tamu',message:'Selamat'});assert.equal(d.error,undefined);assert.equal(d.guestCount,0)});
test('deadline and maximum count are enforced',()=>{assert.equal(confirmationPolicy({...inv,rsvpDeadline:new Date(0)},body).status,403);assert.equal(confirmationPolicy(inv,{...body,guestCount:3}).status,400)});
