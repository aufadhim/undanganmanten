export function checkoutPlan(invitation, permissions, request, catalog) {
 const fail=(message,status=400)=>{const error=new Error(message);error.status=status;throw error};
 const kind=request.kind||'PACKAGE', packageType=request.packageType||'PREMIUM', addons=request.selectedAddons||[];
 if(!['PACKAGE','ADDON'].includes(kind))fail('Jenis pembelian tidak valid.');
 if(!Object.hasOwn(catalog.packages,packageType))fail('Pilihan paket tidak valid.');
 if(!Array.isArray(addons)||addons.some(a=>a!=='QR_GUESTBOOK')||new Set(addons).size!==addons.length)fail('Pilihan add-on tidak valid atau berulang.');
 if(addons.includes('QR_GUESTBOOK')&&permissions.qrGuestbook)fail('Buku tamu QR sudah aktif untuk pernikahan ini.',409);
 const active=invitation.packageType!=='TRIAL'&&new Date(invitation.expiresAt)>new Date()&&!invitation.suspendedAt;
 if(kind==='ADDON'&&(!active||!addons.length))fail('Pembelian add-on membutuhkan paket aktif dan pilihan add-on.');
 if(kind==='PACKAGE'&&active)fail('Paket sudah aktif. Pilih pembelian add-on saja.',409);
 const items=[];
 if(kind==='PACKAGE')items.push({id:`PKG-${packageType}`,price:catalog.packages[packageType].price,quantity:1,name:catalog.packages[packageType].name});
 for(const key of addons){const a=catalog.addons[key];items.push({id:a.id,price:a.price,quantity:1,name:a.name})}
 return {kind,packageType:kind==='ADDON'?invitation.packageType:packageType,addons:[...addons],items,amount:items.reduce((sum,i)=>sum+i.price*i.quantity,0)};
}
