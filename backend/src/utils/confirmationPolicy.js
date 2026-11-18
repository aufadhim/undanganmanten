export function confirmationPolicy(invitation,body){
 const rsvp=invitation.invitationFeatures?.rsvpEnabled!==false,wishes=invitation.invitationFeatures?.wishesEnabled!==false;
 if(!rsvp&&!wishes)return {error:'Konfirmasi dan ucapan tidak diaktifkan.',status:403};
 const name=typeof body.name==='string'?body.name.trim():'',message=typeof body.message==='string'?body.message.trim():'';
 if(!name||name.length>120)return {error:'Nama wajib diisi, maksimal 120 karakter.',status:400};
 if(message.length>500)return {error:'Ucapan maksimal 500 karakter.',status:400};
 if(wishes&&/\b(anjing|babi|bangsat|kontol|memek|asu|ngentot|perek|lonte|bajingan)\b/i.test(message))return {error:'Ucapan mengandung kata-kata yang tidak pantas.',status:400};
 if(!rsvp&&!message)return {error:'Tuliskan ucapan terlebih dahulu.',status:400};
 if(rsvp&&typeof body.attending!=='boolean')return {error:'Pilih konfirmasi kehadiran.',status:400};
 if(rsvp&&invitation.rsvpDeadline&&Date.now()>new Date(invitation.rsvpDeadline).getTime())return {error:'Batas waktu RSVP telah berakhir.',status:403};
 const count=rsvp&&body.attending?body.guestCount:0;
 if(rsvp&&body.attending&&(!Number.isInteger(count)||count<1||count>2))return {error:'Jumlah tamu harus 1 atau 2 orang.',status:400};
 if(body.phone!==undefined&&(typeof body.phone!=='string'||body.phone.length>30))return {error:'Nomor WA maksimal 30 karakter.',status:400};
 return {rsvp,wishes,name,message:wishes?message:'',attending:rsvp?body.attending:false,guestCount:count,phone:body.phone?.trim()||''};
}
