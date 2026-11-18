import 'dotenv/config';import {randomUUID} from 'node:crypto';import assert from 'node:assert/strict';import {prisma} from '../src/lib/prisma.js';import {generateToken} from '../src/utils/jwt.js';import {reserveGeneration,refundGeneration} from '../src/services/illustrationGeneration.js';
let user,admin,inv,request;
try{
 user=await prisma.user.create({data:{email:`credit-qa-${randomUUID()}@test.invalid`,passwordHash:'',isVerified:true}});admin=await prisma.user.create({data:{email:`credit-admin-${randomUUID()}@test.invalid`,passwordHash:'',isVerified:true,role:'ADMIN'}});
 async function api(who,path,method='GET',body,expected=200){const r=await fetch('http://127.0.0.1:4000/api'+path,{method,headers:{Authorization:`Bearer ${generateToken({userId:who.id})}`,'Content-Type':'application/json',...(inv?{'x-invitation-id':inv.id}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert.equal(r.status,expected,JSON.stringify(data));return data}
 inv=(await api(user,'/invitations','POST',{brideName:'Credit',groomName:'Test',weddingDate:'2027-10-01',themeId:'garden-canvas'},201)).invitation;request=await prisma.illustrationRequest.create({data:{invitationId:inv.id,references:['https://example.invalid/reference.jpg'],brief:'Test only; never call external AI.',referenceDetails:{coverage:'partial',bothPartnersVisible:true,processingConsent:true}}});
 const automatic=await api(user,'/themes/illustration-request');assert.equal(automatic.wallet.remaining,3);
 assert.equal((await prisma.illustrationWallet.findUnique({where:{invitationId:inv.id}})).remaining,3);
 const summary=await api(user,'/themes/illustration-request');await api(user,'/themes/illustration-request/generate','POST',{requestKey:randomUUID()},summary.ready?422:503);assert.equal((await prisma.illustrationWallet.findUnique({where:{invitationId:inv.id}})).remaining,3);
 process.env.GEMINI_API_KEY='';await assert.rejects(()=>reserveGeneration(user.id,inv.id,randomUUID()),/belum aktif/);
 // The child process has a fake key ONLY to test reservations. Never start a worker or call the provider.
 process.env.ILLUSTRATION_PROVIDER='gemini';process.env.GEMINI_API_KEY='test-only-never-call-provider';process.env.GEMINI_IMAGE_MODEL='gemini-3.1-flash-image';process.env.ILLUSTRATION_GLOBAL_DAILY_LIMIT='100000';
 await assert.rejects(()=>reserveGeneration(user.id,inv.id,randomUUID()),/tubuh lengkap/);
 await prisma.illustrationRequest.update({where:{id:request.id},data:{referenceDetails:{coverage:'full_body',bothPartnersVisible:true,processingConsent:true}}});
 const key=randomUUID(),first=await reserveGeneration(user.id,inv.id,key);const duplicate=await reserveGeneration(user.id,inv.id,key);assert.equal(first.id,duplicate.id);assert.equal((await prisma.illustrationWallet.findUnique({where:{invitationId:inv.id}})).remaining,2);
 await refundGeneration(first.id,'Uji kegagalan');await refundGeneration(first.id,'Uji duplikat');assert.equal((await prisma.illustrationWallet.findUnique({where:{invitationId:inv.id}})).remaining,3);
 for(let n=0;n<3;n++){const job=await reserveGeneration(user.id,inv.id,randomUUID());await prisma.illustrationGeneration.update({where:{id:job.id},data:{status:'completed'}})}
 await assert.rejects(()=>reserveGeneration(user.id,inv.id,randomUUID()),/Kuota 3 generate/);
 // Legacy grant endpoint and repeated summary reads cannot refill spent uses.
 await api(admin,`/admin/illustrations/${request.id}/credits`,'POST',{reason:'Uji tidak dapat mengisi ulang kuota habis'});
 assert.equal((await api(user,'/themes/illustration-request')).wallet.remaining,0);
 await prisma.invitation.delete({where:{id:inv.id}});assert.equal(await prisma.illustrationGeneration.count({where:{ownerId:user.id}}),4);
 console.log('PASS: automatic 3 uses before payment, provider-disabled no charge, partial body rejected, duplicate click one charge, refund once, exhausted lifetime quota cannot refill. No external AI requests.');
}finally{if(user)await prisma.illustrationGeneration.deleteMany({where:{ownerId:user.id}});if(request)await prisma.adminAuditLog.deleteMany({where:{targetId:request.id}});for(const u of [user,admin])if(u)await prisma.user.delete({where:{id:u.id}}).catch(()=>{});await prisma.$disconnect();console.log('Disposable credit accounts cleaned.');}
