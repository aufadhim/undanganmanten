import test from 'node:test';import assert from 'node:assert/strict';import{checkoutPlan}from'../src/utils/checkoutPlan.js';
const catalog={packages:{STANDARD:{price:79000,name:'Standard'},PREMIUM:{price:119000,name:'Premium'}},addons:{QR_GUESTBOOK:{id:'QR_GUESTBOOK',price:20000,name:'Buku tamu'}}};
const active={packageType:'PREMIUM',expiresAt:'2099-01-01'},trial={packageType:'TRIAL',expiresAt:'2099-01-01'};
const quote=(i,r,p={qrGuestbook:false})=>checkoutPlan(i,p,r,catalog);
test('addon-only charges 20000, keeps existing package and never includes a package line',()=>{const p=quote(active,{kind:'ADDON',selectedAddons:['QR_GUESTBOOK']});assert.equal(p.amount,20000);assert.equal(p.packageType,'PREMIUM');assert.equal(p.items.length,1);assert.equal(p.items[0].id,'QR_GUESTBOOK')});
test('new package plus guestbook costs 139000',()=>assert.equal(quote(trial,{selectedAddons:['QR_GUESTBOOK']}).amount,139000));
test('active or shared QR cannot be repurchased',()=>assert.throws(()=>quote(active,{kind:'ADDON',selectedAddons:['QR_GUESTBOOK']},{qrGuestbook:true}),/sudah aktif/));
test('duplicate, unknown and empty addon orders are rejected',()=>{for(const selectedAddons of [[],['QR_GUESTBOOK','QR_GUESTBOOK'],['UNKNOWN']])assert.throws(()=>quote(active,{kind:'ADDON',selectedAddons}))});
test('trial/expired/suspended users cannot buy standalone add-on; active users cannot repay package',()=>{for(const i of [trial,{...active,expiresAt:'2020-01-01'},{...active,suspendedAt:new Date()}])assert.throws(()=>quote(i,{kind:'ADDON',selectedAddons:['QR_GUESTBOOK']}));assert.throws(()=>quote(active,{}),/Paket sudah aktif/)});

test('Standard costs 79000 and 99000 with QR',()=>{const base=quote(trial,{packageType:'STANDARD'});assert.equal(base.amount,79000);assert.equal(base.packageType,'STANDARD');assert.equal(quote(trial,{packageType:'STANDARD',selectedAddons:['QR_GUESTBOOK']}).amount,99000);assert.throws(()=>quote(trial,{packageType:'TRIAL'}),/Pilihan paket tidak valid/)});
