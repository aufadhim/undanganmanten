import 'dotenv/config';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import sharp from 'sharp';import {prisma} from '../src/lib/prisma.js';import {generateToken} from '../src/utils/jwt.js';import {cleanupOwnerAssets} from '../src/lib/storage.js';
const base=process.env.SMOKE_API||'http://127.0.0.1:4011/api';let user;
async function call(path,method='GET',body){const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${generateToken({userId:user.id})}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()}}
try{
 user=await prisma.user.create({data:{email:`storage-${randomUUID()}@test.invalid`,passwordHash:'test-only'}});
 const make=()=>call('/invitations','POST',{brideName:'Uji',groomName:'Kuota',themeId:'garden-canvas',weddingDate:'2027-12-01'});
 const a=(await make()).data.invitation,b=(await make()).data.invitation,c=(await make()).data.invitation;
 await call(`/invitations/${b.id}/lifecycle`,'POST',{action:'archive'});await prisma.invitation.update({where:{id:c.id},data:{packageType:'PREMIUM'}});
 assert.equal((await make()).status,403);assert.equal((await call(`/invitations/${a.id}/duplicate`,'POST')).status,403);
 assert.equal((await call(`/invitations/${c.id}`,'DELETE')).status,400);
 const image=await sharp({create:{width:24,height:24,channels:4,background:'#809072'}}).png().toBuffer();
 async function upload(){const form=new FormData();form.set('photo',new Blob([image],{type:'image/png'}),'test.png');const r=await fetch(base+'/invitations/me/couple-profile/photo',{method:'POST',headers:{Authorization:`Bearer ${generateToken({userId:user.id})}`,'x-invitation-id':a.id},body:form});return {status:r.status,data:await r.json()}}
 const photo=await upload();assert.equal(photo.status,200);const url=photo.data.coupleProfile.groomPhoto;
 const seed=async(bytes,target)=>prisma.uploadedAsset.create({data:{ownerId:user.id,uploadedForId:target,invitationIds:[target],url:`http://127.0.0.1:4011/uploads/${randomUUID()}.webp`,key:`${randomUUID()}.webp`,backend:'local',bytes,state:'ready'}});
 const accountCap=await seed(150*1024*1024,'quota-only');assert.equal((await upload()).status,413);await prisma.uploadedAsset.delete({where:{id:accountCap.id}});
 const invitationCap=await seed(50*1024*1024,a.id);assert.equal((await upload()).status,413);await prisma.uploadedAsset.delete({where:{id:invitationCap.id}});

 assert.equal((await call(`/invitations/${c.id}`,'DELETE',{confirmSlug:c.slug})).status,200);
 const copied=await call(`/invitations/${a.id}/duplicate`,'POST');assert.equal(copied.status,201);const d=copied.data.invitation;
 const assets=await prisma.uploadedAsset.findMany({where:{ownerId:user.id}});assert.equal(assets.length,1);assert.ok(assets[0].invitationIds.includes(d.id));
 assert.equal((await call(`/invitations/${a.id}`,'DELETE',{confirmSlug:a.slug})).status,200);assert.equal((await fetch(url)).status,200);
 assert.equal((await call(`/invitations/${d.id}`,'DELETE',{confirmSlug:d.slug})).status,200);assert.equal((await fetch(url)).status,404);assert.equal(await prisma.uploadedAsset.count({where:{ownerId:user.id}}),0);
 console.log('PASS: total quota includes archive and paid; duplicate quota; permanent-delete confirmation; shared file retained until last reference; physical local file cleanup.');
}finally{if(user){await prisma.user.delete({where:{id:user.id}});await cleanupOwnerAssets(user.id)}await prisma.$disconnect();console.log('Disposable account and files cleaned.')}
