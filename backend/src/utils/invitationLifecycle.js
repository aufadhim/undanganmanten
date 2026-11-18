export const ACTIVE_STATUSES=['draft','published','expired'];
export function publicationChecklist(inv,now=new Date()){
 const nonempty=v=>typeof v==='string'&&v.trim().length>0;
 return [
 {key:'lifecycle',label:'Undangan berada di daftar aktif',ok:ACTIVE_STATUSES.includes(inv.status)},
 {key:'package',label:'Paket sudah diaktivasi',ok:inv.packageType!=='TRIAL'},
 {key:'expiry',label:inv.packageType==='TRIAL'?'Masa aktif dimulai setelah aktivasi paket':'Masa aktif belum berakhir',ok:inv.packageType==='TRIAL'||new Date(inv.expiresAt)>now},
 {key:'profile',label:'Nama kedua mempelai lengkap',ok:nonempty(inv.coupleProfile?.brideName)&&nonempty(inv.coupleProfile?.groomName)},
 {key:'events',label:'Tanggal, jam, lokasi, dan alamat acara lengkap',ok:!!inv.events?.length&&inv.events.every(e=>e.date&&e.startTime&&nonempty(e.venueName)&&nonempty(e.address))},
 ];
}
export function lifecycleTransition(current,action){
 if(action==='archive'&&current!=='trashed')return 'archived';
 if(action==='restore'&&current==='archived')return 'draft';
 if(action==='unpublish'&&current==='published')return 'draft';
 return null;
}
export function cloneContent(source){
 const one=['coupleProfile','quoteSettings','themeSettings','invitationFeatures','giftSettings','livestreamSettings'];
 const many=['events','rundowns','galleryMedia','timelineStories'];
 const clean=row=>Object.fromEntries(Object.entries(row).filter(([key,value])=>!['id','invitationId','createdAt','updatedAt'].includes(key)&&value!==null));
 const data={};for(const key of one)if(source[key])data[key]={create:clean(source[key])};
 for(const key of many)if(source[key]?.length)data[key]={create:source[key].map(clean)};
 return data;
}
