import 'dotenv/config';import assert from 'node:assert/strict';import{randomUUID,createHash}from'node:crypto';import{prisma}from'../src/lib/prisma.js';import{generateToken}from'../src/utils/jwt.js';import{activateOrder}from'../src/services/orderActivation.js';import{getEntitlements}from'../src/utils/entitlements.js';
let user,wedding,other,accessId;const guestIds=[];
const request=async(path,{token,staff,method='GET',body,status=200}={})=>{const r=await fetch('http://127.0.0.1:4000/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} :{}),...(staff?{'x-guestdesk-token':staff}:{})},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,status,`${path}: ${JSON.stringify(d)}`);return d};
try{
 user=await prisma.user.create({data:{email:`desk-qa-${randomUUID()}@test.invalid`,passwordHash:'',isVerified:true}});const token=generateToken({userId:user.id});
 wedding=await prisma.wedding.create({data:{userId:user.id,title:'Disposable reception QA',weddingDate:new Date('2099-01-01')}});other=await prisma.wedding.create({data:{userId:user.id,title:'Disposable other QA',weddingDate:new Date('2099-01-01')}});
 const data={userId:user.id,weddingId:wedding.id,weddingDate:new Date('2099-01-01'),expiresAt:new Date('2099-02-01')};
 const inv=await prisma.invitation.create({data:{...data,slug:'desk-qa-'+randomUUID(),packageType:'PREMIUM'}});const sibling=await prisma.invitation.create({data:{...data,slug:'desk-qa-'+randomUUID()}});
 const guest=await prisma.guest.create({data:{weddingId:wedding.id,invitationId:inv.id,name:'Disposable guest',phone:'08123456789',paxLimit:2}});guestIds.push(guest.id);
 const foreign=await prisma.guest.create({data:{weddingId:other.id,name:'Other wedding',paxLimit:2}});guestIds.push(foreign.id);
 const order=await prisma.order.create({data:{invitationId:inv.id,packageType:'PREMIUM',kind:'ADDON',amount:20000,addons:['QR_GUESTBOOK'],midtransOrderId:'desk-qa-'+randomUUID()}});
 await activateOrder({...order,invitation:{weddingDate:inv.weddingDate}});assert.equal((await getEntitlements(sibling)).qrGuestbook,true);
 const before=await prisma.invitation.findUnique({where:{id:inv.id}});assert.equal(before.expiresAt.toISOString(),inv.expiresAt.toISOString());
 await request(`/guest-desk/access/${inv.id}`,{status:401});
 const issued=await request(`/guest-desk/access/${inv.id}`,{token,method:'POST',body:{label:'Disposable desk',hours:6},status:201});accessId=issued.access.id;
 const saved=await prisma.guestDeskAccess.findUnique({where:{id:accessId}});assert.notEqual(saved.tokenHash,issued.token);assert.equal(saved.tokenHash,createHash('sha256').update(issued.token).digest('hex'));
 const session=await request('/guest-desk/session',{staff:issued.token});assert.equal(session.guests.length,1);assert.equal('phone' in session.guests[0],false);assert.equal('rsvp' in session.guests[0],false);
 await request('/invitations',{token:issued.token,status:401});
 await request(`/guest-desk/guests/${foreign.id}/checkin`,{staff:issued.token,method:'POST',body:{count:1},status:404});
 await request(`/guest-desk/guests/${guest.id}/checkin`,{staff:issued.token,method:'POST',body:{count:3},status:400});
 await request(`/guest-desk/guests/${guest.id}/checkin`,{staff:issued.token,method:'POST',body:{count:2}});
 await request(`/guest-desk/guests/${guest.id}/checkin`,{staff:issued.token,method:'POST',body:{count:1},status:409});
 await request(`/guest-desk/guests/${guest.id}/checkin`,{staff:issued.token,method:'DELETE'});
 assert.equal(await prisma.adminAuditLog.count({where:{actorId:`guestdesk:${accessId}`}}),2);
 await request(`/guest-desk/access/${inv.id}/${accessId}`,{token,method:'DELETE'});await request('/guest-desk/session',{staff:issued.token,status:401});
 const expired=await request(`/guest-desk/access/${inv.id}`,{token,method:'POST',body:{label:'Disposable expiry',hours:1},status:201});await prisma.guestDeskAccess.update({where:{id:expired.access.id},data:{expiresAt:new Date(0)}});await request('/guest-desk/session',{staff:expired.token,status:401});
 await prisma.invitation.delete({where:{id:inv.id}});assert.equal((await getEntitlements(sibling)).qrGuestbook,true);
 console.log('PASS: wedding-owned rights survive source deletion; staff is scoped/revocable/expiring; minimal data; count validation; duplicate prevention; audit; no owner access.');
}finally{if(user){await prisma.adminAuditLog.deleteMany({where:{OR:[{actorId:user.id},...(accessId?[{actorId:`guestdesk:${accessId}`}]:[]),{targetId:{in:guestIds}}]}});await prisma.wedding.deleteMany({where:{userId:user.id}});await prisma.user.delete({where:{id:user.id}})}await prisma.$disconnect();console.log('Disposable QA records cleaned.');}
