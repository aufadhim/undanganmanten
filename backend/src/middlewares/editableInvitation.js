import {prisma} from '../lib/prisma.js';
/** Protect editor subresources after an invitation has been archived or trashed. */
export async function editableInvitation(req,res,next){
 try{
  const id=req.headers['x-invitation-id']||req.query.invitationId||req.body?.invitationId;
  const invitation=await prisma.invitation.findFirst({where:{userId:req.userId,...(id?{id}:{}),status:{notIn:['archived','trashed']}},select:{id:true},orderBy:{createdAt:'desc'}});
  if(!invitation)return res.status(409).json({error:'Pilih undangan aktif atau pulihkan undangan dari Arsip/Sampah sebelum mengedit.'});
  req.headers['x-invitation-id']=invitation.id;next();
 }catch(e){res.status(500).json({error:'Undangan belum dapat diperiksa.'})}
}
