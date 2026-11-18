import 'dotenv/config';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {prisma} from '../src/lib/prisma.js';import {generateToken} from '../src/utils/jwt.js';
const base='http://127.0.0.1:4000/api',users=[];
async function account(){const user=await prisma.user.create({data:{email:`wedding-${randomUUID()}@test.invalid`,passwordHash:'no-login',isVerified:true}});users.push(user.id);return {id:user.id,token:generateToken({userId:user.id})}}
async function call(owner,path,method='GET',body,id){const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${owner.token}`,'Content-Type':'application/json',...(id?{'x-invitation-id':id}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()}}
try{
 const owner=await account(),foreign=await account(),payload={brideName:'Uji',groomName:'Pernikahan',weddingDate:'2027-12-01',themeId:'garden-canvas'};
 const created=await call(owner,'/invitations','POST',payload);assert.equal(created.status,201);const a=created.data.invitation;assert.ok(a.weddingId);
 const added=await call(owner,'/invitations/me/guests','POST',{name:'Tamu Bersama',paxLimit:2},a.id);assert.equal(added.status,201);const guest=added.data.guest;assert.equal(guest.weddingId,a.weddingId);
 const madeB=await call(owner,'/invitations','POST',{...payload,weddingId:a.weddingId});assert.equal(madeB.status,201);const b=madeB.data.invitation;
 const shared=await call(owner,'/invitations/me/guests','GET',null,b.id);assert.equal(shared.data.guests[0].id,guest.id);
 const bulk=await call(owner,'/invitations/me/guests/bulk','POST',{guests:[{name:'Tamu Impor',paxLimit:1}]},b.id);assert.equal(bulk.status,201);
 assert.equal((await call(foreign,`/weddings/${a.weddingId}/guests`)).status,404);
 assert.equal((await call(foreign,'/invitations','POST',{...payload,weddingId:a.weddingId})).status,404);
 for(const inv of [a,b]){await prisma.invitation.update({where:{id:inv.id},data:{packageType:'PREMIUM',expiresAt:new Date('2028-01-01'),invitationFeatures:{update:{giftEnabled:false,livestreamEnabled:false}},events:{create:{type:'akad',date:new Date('2027-12-01'),startTime:'08:00',venueName:'Taman',address:'Alamat'}}}});assert.equal((await call(owner,`/invitations/${inv.id}`,'PATCH',{status:'published',rsvpOpenToPublic:false})).status,200);assert.equal((await call(owner,`/invitations/public/${inv.slug}/guest/${guest.id}`)).status,200)}
 const rsvp=await call(owner,`/invitations/public/${b.slug}/rsvp?g=${guest.id}`,'POST',{name:guest.name,attending:true,guestCount:2});assert.equal(rsvp.status,201);
 const summary=await call(owner,'/invitations/me/rsvp-summary','GET',null,a.id);assert.equal(summary.data.summary.attending,1);
 assert.equal((await call(owner,`/invitations/me/guests/${guest.id}/checkin`,'POST',{},b.id)).status,200);
 const checked=await call(owner,'/invitations/me/guests','GET',null,a.id);assert.equal(checked.data.guests.find(g=>g.id===guest.id).checkedIn,true);
 await call(owner,`/invitations/${a.id}`,'DELETE',{confirmSlug:a.slug});assert.equal((await call(owner,`/invitations/public/${b.slug}/guest/${guest.id}`)).status,200);
 await call(owner,`/invitations/${b.id}`,'DELETE',{confirmSlug:b.slug});assert.ok(await prisma.guest.findUnique({where:{id:guest.id}}));
 const retained=await call(owner,`/weddings/${a.weddingId}/guests`);assert.equal(retained.status,200);assert.equal(retained.data.guests.length,2);
 assert.equal((await call(owner,`/weddings/${a.weddingId}/guests`,'POST',{name:'Tamu tanpa desain aktif'})).status,201);
 console.log('PASS: shared wedding guests; bulk import; owner isolation; stable personal links across designs; shared RSVP/check-in; guest data survives design deletion; standalone wedding directory.');
}finally{for(const id of users)await prisma.user.delete({where:{id}});await prisma.$disconnect();console.log('Disposable accounts cleaned.');}
