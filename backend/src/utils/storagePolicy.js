export const MAX_INVITATIONS=3;
export const INVITATION_BYTES=50*1024*1024;
export const ACCOUNT_BYTES=150*1024*1024;
export function uploadBudget(accountBytes,invitationBytes,newBytes){
 if(newBytes+accountBytes>ACCOUNT_BYTES)return 'Penyimpanan akun maksimal 150 MB. Hapus media atau undangan yang tidak dipakai; arsip tetap dihitung.';
 if(newBytes+invitationBytes>INVITATION_BYTES)return 'Penyimpanan undangan maksimal 50 MB. Hapus media yang tidak dipakai sebelum mengunggah lagi.';
 return null;
}
export function stringsIn(value,result=new Set()){
 if(typeof value==='string')result.add(value);
 else if(Array.isArray(value))for(const v of value)stringsIn(v,result);
 else if(value&&typeof value==='object'&&!(value instanceof Date))for(const v of Object.values(value))stringsIn(v,result);
 return result;
}
