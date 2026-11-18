import test from 'node:test';
import assert from 'node:assert/strict';
import {invitationStatus,invitationStatusLabel} from '../src/utils/invitationStatus.js';
const now=new Date('2026-11-05');
test('legacy expired trial is an editable draft without a paid expiry badge',()=>{
 const inv={packageType:'TRIAL',status:'expired',expiresAt:'2020-01-01'};
 assert.equal(invitationStatus(inv,now),'draft');assert.equal(invitationStatusLabel(inv,now),'Draft');
 assert.equal(invitationStatus({...inv,status:'archived'},now),'archived');
});
test('paid publication still respects expiry and archives',()=>{
 const inv={packageType:'PREMIUM',status:'published',expiresAt:'2026-12-30'};
 assert.equal(invitationStatusLabel(inv,now),'Terbit');
 assert.equal(invitationStatusLabel({...inv,expiresAt:'2020-01-01'},now),'Masa aktif berakhir');
 assert.equal(invitationStatusLabel({...inv,status:'archived'},now),'Diarsipkan');
});
