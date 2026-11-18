import {guestScope} from '../utils/weddingGuests.js';
export async function saveConfirmation(db,inv,data,guestId,maxGuests){
 return db.$transaction(async tx=>{
   let guest=guestId?await tx.guest.findFirst({where:{id:guestId,...guestScope(inv)}}):null;
   if(guestId&&!guest)throw Object.assign(Error('Tautan tamu tidak valid.'),{status:403});
   if(data.rsvp&&!guest&&!inv.rsvpOpenToPublic)throw Object.assign(Error('RSVP hanya tersedia melalui tautan pribadi tamu.'),{status:403});
   if(data.rsvp&&!guest){
    guest=await tx.guest.findFirst({where:{...guestScope(inv),name:data.name}});
    if(!guest){if(maxGuests!==null&&await tx.guest.count({where:guestScope(inv)})>=maxGuests)throw Object.assign(Error('Daftar tamu sudah mencapai kuota paket.'),{status:403});
     guest=await tx.guest.create({data:{invitationId:inv.id,weddingId:inv.weddingId,name:data.name,phone:data.phone||null}})}
   }
   let rsvp=null,wish=null;
   if(data.rsvp){if(data.guestCount>(guest.paxLimit||2))throw Object.assign(Error(`Maksimal ${guest.paxLimit||2} orang untuk undangan ini.`),{status:400});const values={attending:data.attending,guestCount:data.guestCount};rsvp=await tx.rsvpResponse.upsert({where:{guestId:guest.id},create:{...values,guestId:guest.id},update:values})}
   if(data.wishes&&data.message){const existing=guest?await tx.wish.findFirst({where:{guestId:guest.id,invitationId:inv.id}}):null;const values={senderName:guest?.name||data.name,message:data.message,isHidden:Boolean(inv.invitationFeatures?.wishesModerationEnabled)};wish=existing?await tx.wish.update({where:{id:existing.id},data:values}):await tx.wish.create({data:{...values,invitationId:inv.id,guestId:guest?.id||null}})}
   return {rsvp,wish};
 },{isolationLevel:'Serializable'});
}
