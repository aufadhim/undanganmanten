import 'dotenv/config';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {prisma} from '../src/lib/prisma.js';import {generateToken} from '../src/utils/jwt.js';
const base='http://127.0.0.1:4000/api';const made=[];let oldHidden;
async function request(path,token,method='GET',body){const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()}}
try{for(const role of ['ADMIN','USER'])made.push(await prisma.user.create({data:{email:`admin-ops-${randomUUID()}@test.invalid`,passwordHash:'',role,isVerified:true}}));const [admin,user]=made,at=generateToken({userId:admin.id}),ut=generateToken({userId:user.id});
assert.equal((await request('/admin/users',ut)).status,403);
for(const path of ['stats','users','invitations','orders','templates','operations','audit']){const r=await request(`/admin/${path}`,at);assert.equal(r.status,200,`${path}: ${JSON.stringify(r.data)}`);assert.ok(!JSON.stringify(r.data).includes('passwordHash'));}
assert.equal((await request(`/admin/users/${admin.id}`,at,'PATCH',{role:'USER',reason:'Test demote self guard'})).status,409);
assert.equal((await request(`/admin/users/${user.id}`,at,'PATCH',{suspended:true})).status,400);
assert.equal((await request(`/admin/users/${user.id}`,at,'PATCH',{suspended:true,reason:'Disposable account test'})).status,200);
assert.equal((await request('/weddings',ut)).status,403);
assert.equal((await request(`/admin/users/${user.id}`,at,'PATCH',{suspended:false,reason:'Disposable account restore'})).status,200);
const inv=await request('/invitations',ut,'POST',{brideName:'TestBride',groomName:'TestGroom',weddingDate:'2027-08-12',themeId:'garden-canvas'});assert.equal(inv.status,201,JSON.stringify(inv));const id=inv.data.invitation.id;
await prisma.invitation.update({where:{id},data:{status:'published',packageType:'STANDARD',expiresAt:new Date(Date.now()+86400000)}});
const guest=await prisma.guest.create({data:{invitationId:id,weddingId:inv.data.invitation.weddingId,name:'QA Guest'}});
assert.equal((await request(`/invitations/public/${inv.data.invitation.slug}`,ut)).status,200);
assert.equal((await request(`/invitations/public/${inv.data.invitation.slug}/guest/${guest.id}`,ut)).status,200);
assert.equal((await request(`/admin/invitations/${id}`,at,'PATCH',{suspended:true,reason:'Disposable invitation test'})).status,200);
assert.equal((await request(`/invitations/public/${inv.data.invitation.slug}`,ut)).status,404);
assert.equal((await request(`/invitations/public/${inv.data.invitation.slug}/guest/${guest.id}`,ut)).status,404);
assert.equal((await request(`/invitations/public/${inv.data.invitation.slug}/rsvp`,ut,'POST',{name:'QA Guest',attending:true})).status,404);
assert.equal((await request(`/admin/invitations/${id}`,at,'PATCH',{suspended:false,reason:'Disposable invitation restore'})).status,200);
assert.equal((await request(`/invitations/public/${inv.data.invitation.slug}`,ut)).status,200);
assert.equal((await request(`/admin/invitations/${id}`,at,'PATCH',{status:'published',reason:'Bypass checklist test'})).status,400);
const order=await prisma.order.create({data:{invitationId:id,amount:79000,packageType:'STANDARD',midtransOrderId:`qa-${randomUUID()}`}});
assert.equal((await request(`/admin/orders/${order.id}/activate`,at,'POST',{reason:'Disposable manual access test'})).status,200);
assert.equal((await request(`/admin/orders/${order.id}/activate`,at,'POST',{reason:'Duplicate activation test'})).status,409);
assert.equal((await prisma.order.findUnique({where:{id:order.id}})).activationSource,'manual');
const logs=await prisma.adminAuditLog.findMany({where:{actorId:admin.id}});assert.ok(logs.length>=5);
console.log('PASS: admin access, safe payloads, self-protection, reasons, account and public suspension, manual activation idempotency/source, atomic audit.');
}finally{for(const u of made)await prisma.user.delete({where:{id:u.id}});await prisma.adminAuditLog.deleteMany({where:{actorId:{in:made.map(u=>u.id)}}});await prisma.$disconnect();console.log('Disposable test data cleaned.');}
