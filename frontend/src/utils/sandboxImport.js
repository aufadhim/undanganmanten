// Only an explicit “Daftar & Simpan” action may import a local draft.
const pending=new Map();
export function importSandboxOnce({storage,api,supportedThemes}){
 const draft=storage.getItem('sandbox_invitation');
 if(storage.getItem('sandbox_import_requested')!=='true'||!draft)return Promise.resolve(false);
 if(pending.has(draft))return pending.get(draft);
 const task=(async()=>{
  const data=JSON.parse(draft),themeId=supportedThemes.includes(data.themeId)?data.themeId:'eternal';
  const weddingDate=data.events?.find(e=>e.date)?.date||data.weddingDate||new Date(Date.now()+180*86400000).toISOString().slice(0,10);
  // Persist partial progress so retry never creates a second invitation.
  const progress=JSON.parse(storage.getItem('sandbox_import_progress')||'null');
  let id=progress?.draft===draft?progress.id:null;
  if(!id){const response=await api.post('/invitations',{brideName:data.coupleProfile?.brideName||'Wanita',groomName:data.coupleProfile?.groomName||'Pria',themeId,weddingDate});id=response.data.invitation.id;storage.setItem('sandbox_import_progress',JSON.stringify({draft,id}))}
  const headers={'x-invitation-id':id};
  if(data.coupleProfile)await api.patch('/invitations/me/couple-profile',data.coupleProfile,{headers});
  if(data.themeSettings){
   const settings={...data.themeSettings},assets=progress?.draft===draft?{...progress.assets}:{};
   const resolved=new Map();
   for(const field of ['coverImageUrl','coverSecondImageUrl']){
    const source=settings[field];if(!/^data:image\/(png|jpeg|webp);base64,/i.test(source||''))continue;
    let url=assets[field]||resolved.get(source);
    if(!url){
     const [meta,encoded]=source.split(','),bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
     if(bytes.length>5*1048576)throw Error('Ilustrasi mode coba melebihi 5 MB.');
     const body=new FormData();body.append('invitationId',id);body.append('file',new File([bytes],'ilustrasi.'+meta.match(/image\/(\w+)/)[1],{type:meta.slice(5).split(';')[0]}));
     const response=await api.post('/themes/upload-asset',body,{headers});url=response.data.url;
    }
    assets[field]=url;resolved.set(source,url);settings[field]=url;
    storage.setItem('sandbox_import_progress',JSON.stringify({draft,id,assets}));
   }
   await api.patch('/invitations/me/theme',settings,{headers});
  }
  await api.patch(`/invitations/${id}`,{themeId,weddingDate},{headers});
  if(storage.getItem('sandbox_invitation')===draft)storage.removeItem('sandbox_invitation');
  storage.removeItem('sandbox_import_progress');return true;
 })();
 pending.set(draft,task);
 task.finally(()=>{pending.delete(draft);storage.removeItem('sandbox_import_requested')}).catch(()=>{});
 return task;
}
