export function normalizeGift(gift={}){
 gift=gift||{};
 const type=gift.type==='physical_gift'?'address':['bank_transfer','address','both'].includes(gift.type)?gift.type:'both';
 const rows=Array.isArray(gift.bankAccounts)&&gift.bankAccounts.length?gift.bankAccounts:gift.accountNumber?[gift]:[];
 return {type,shippingAddress:String(gift.shippingAddress||'').trim(),bankAccounts:rows.map(x=>({bankName:String(x.bankName||'').trim(),accountNumber:String(x.accountNumber||'').trim(),accountHolder:String(x.accountHolder||'').trim()}))};
}
export function giftErrors(gift){
 const errors={};if(gift.type!=='address'){
 if(!gift.bankAccounts.length)errors.accounts='Tambahkan minimal satu rekening.';
 gift.bankAccounts.forEach((a,i)=>{for(const [key,label,max]of[['bankName','Nama bank / e-wallet',100],['accountNumber','Nomor rekening / HP',100],['accountHolder','Nama pemilik',150]]){if(!a[key]?.trim())errors[`${i}.${key}`]=`${label} wajib diisi.`;else if(a[key].length>max)errors[`${i}.${key}`]=`Maksimal ${max} karakter.`}})}
 if(gift.type!=='bank_transfer'&&!gift.shippingAddress?.trim())errors.shippingAddress='Alamat pengiriman wajib diisi.';
 return errors;
}
