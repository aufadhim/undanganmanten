import test from 'node:test';import assert from 'node:assert/strict';
import {prisma} from '../src/lib/prisma.js';import {activateOrder} from '../src/services/orderActivation.js';
test('late payment keeps archived/trashed invitations hidden and respects feature choices',async()=>{
 const original=prisma.$transaction;
 try{for(const status of ['archived','trashed','published','draft']){let update,features;prisma.$transaction=async fn=>fn({$queryRaw:async()=>[],order:{findUnique:async()=>({status:'PENDING'}),update:async()=>{}},invitation:{findUnique:async()=>({status}),update:async args=>{update=args.data}},invitationFeatures:{upsert:async args=>{features=args.update}}});await activateOrder({id:'order',invitationId:'invitation',packageType:'PREMIUM',invitation:{weddingDate:'2027-12-01'}});assert.equal(update.status,status);assert.equal(update.packageType,'PREMIUM');assert.deepEqual(features,{})}}
 finally{prisma.$transaction=original}
});
test('verified gateway confirmation reconciles manual activation without applying package twice',async()=>{
 const original=prisma.$transaction;let updates=[],logs=[];
 try{prisma.$transaction=async fn=>fn({$queryRaw:async()=>[],order:{findUnique:async()=>({status:'SUCCESS',activationSource:'manual'}),update:async args=>updates.push(args.data)},adminAuditLog:{create:async args=>logs.push(args.data)},invitation:{update:async()=>assert.fail('Package must not activate twice')}});
 await activateOrder({id:'order',invitationId:'invitation',invitation:{weddingDate:'2027-12-01'}});assert.equal(updates.length,1);assert.equal(updates[0].activationSource,'gateway');assert.equal(logs[0].action,'order.payment_confirmed');
 }finally{prisma.$transaction=original}
});
test('addon activation preserves package, expiry and publication and grants wedding-owned QR',async()=>{
 const original=prisma.$transaction;let grant;
 try{prisma.$transaction=async fn=>fn({$queryRaw:async()=>[],order:{findUnique:async()=>({status:'PENDING',kind:'ADDON',addons:['QR_GUESTBOOK']}),update:async()=>{}},invitation:{findUnique:async()=>({weddingId:'wedding'}),update:async()=>assert.fail('Addon must not rewrite invitation')},weddingAddon:{upsert:async args=>{grant=args.create}},invitationFeatures:{upsert:async()=>{}}});
 await activateOrder({id:'order',invitationId:'invitation',packageType:'PREMIUM',invitation:{weddingDate:'2099-12-01'}});assert.deepEqual(grant,{weddingId:'wedding',addon:'QR_GUESTBOOK'});
 }finally{prisma.$transaction=original}
});
