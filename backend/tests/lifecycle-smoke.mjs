// Creates disposable accounts only; never modifies existing users.
import 'dotenv/config';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {prisma} from '../src/lib/prisma.js';import {generateToken} from '../src/utils/jwt.js';
const users=[],base='http://127.0.0.1:4000/api/invitations';
async function account(){const u=await prisma.user.create({data:{email:`lifecycle-${randomUUID()}@test.invalid`,passwordHash:'test-only-no-login',isVerified:true}});users.push(u.id);return generateToken({userId:u.id})}
async function call(token,path='',method='GET',body){const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()}}
try{
 const token=await account(),other=await account();const created=await call(token,'','POST',{brideName:'Uji',groomName:'Alur',themeId:'garden-canvas',weddingDate:'2027-12-01'});assert.equal(created.status,201);const id=created.data.invitation.id,slug=created.data.invitation.slug;
 assert.equal((await call(other,`/${id}/lifecycle`,'POST',{action:'archive'})).status,404);
 assert.equal((await call(token,`/${id}/publication`)).data.ready,false);
 assert.equal((await call(token,`/${id}`,'PATCH',{status:'published'})).status,400);
 await prisma.invitation.update({where:{id},data:{packageType:'PREMIUM',expiresAt:new Date('2028-01-01'),events:{create:{type:'akad',date:new Date('2027-12-01'),startTime:'08:00',venueName:'Taman Uji',address:'Alamat uji'}},invitationFeatures:{update:{giftEnabled:false,livestreamEnabled:false}},guests:{create:{name:'Tamu uji',weddingId:created.data.invitation.weddingId}},wishes:{create:{senderName:'Uji',message:'Uji'}}}});
 assert.equal((await call(token,`/${id}/publication`)).data.ready,true);
 assert.equal((await call(token,`/${id}`,'PATCH',{status:'published'})).status,200);
 assert.equal((await call(token,`/public/${slug}`)).status,200);
 assert.equal((await call(token,`/${id}/lifecycle`,'POST',{action:'unpublish'})).data.invitation.status,'draft');assert.equal((await call(token,`/public/${slug}`)).status,404);
 await call(token,`/${id}/lifecycle`,'POST',{action:'archive'});assert.equal((await call(token,`/${id}`,'PATCH',{slug:'should-not-change'})).status,409);assert.equal((await call(token,`/${id}/lifecycle`,'POST',{action:'restore'})).data.invitation.status,'draft');
 const copy=await call(token,`/${id}/duplicate`,'POST');if(copy.status!==201){const {duplicateInvitation}=await import('../src/controllers/invitationController.js');await duplicateInvitation({params:{id},userId:users[0]},{status(code){return this},json(data){console.log('Duplicate diagnostic:',data)}})}assert.equal(copy.status,201);const copied=await prisma.invitation.findUnique({where:{id:copy.data.invitation.id},include:{guests:true,wishes:true,events:true}});assert.equal(copied.packageType,'TRIAL');assert.equal(copied.guests.length,0);assert.equal(copied.wishes.length,0);assert.equal(copied.events.length,1);
 assert.equal((await call(token,`/${id}`,'DELETE',{confirmSlug:slug})).status,200);assert.equal(await prisma.invitation.findUnique({where:{id}}),null);assert.equal(await prisma.guest.count({where:{invitationId:id}}),0);
 console.log('PASS: owner isolation; publication guard; publish/unpublish; public access; archive/restore; content-only duplicate; permanent deletion.');
}finally{for(const id of users)await prisma.user.delete({where:{id}});await prisma.$disconnect();console.log('Disposable smoke accounts and records removed.');}
