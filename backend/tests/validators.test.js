import test from 'node:test';
import assert from 'node:assert/strict';
import { giftSettingsSchema, guestSchema, invitationFeaturesSchema, loginSchema, resetPasswordSchema, signupSchema, updateInvitationSchema, updateThemeSettingsSchema } from '../src/utils/validators.js';
import { slugify } from '../src/utils/slug.js';

test('signup menolak email dan password tidak valid', () => {
  assert.equal(signupSchema.safeParse({ email: 'salah', password: 'pendek' }).success, false);
  assert.equal(signupSchema.safeParse({ email: 'user@example.com', password: 'Password123' }).success, true);
});

test('login mewajibkan password', () => {
  assert.equal(loginSchema.safeParse({ email: 'user@example.com', password: '' }).success, false);
});

test('reset password mewajibkan token dan minimal delapan karakter', () => {
  assert.equal(resetPasswordSchema.safeParse({ token: '', newPassword: '123' }).success, false);
});

test('slug dinormalisasi untuk URL', () => {
  assert.equal(slugify(' Aisyah & Auf '), 'aisyah-auf');
  assert.equal(slugify(''), '');
});

test('typography menerima spacing aman dan menolak injeksi CSS', () => {
  assert.equal(updateThemeSettingsSchema.safeParse({
    typography: {
      fontHeading: "'Bodoni Moda', serif",
      headingLineHeight: 1.25,
      bodyLineHeight: 1.7,
      headingLetterSpacing: 0.04,
      bodyLetterSpacing: 0.01,
    },
  }).success, true);
  assert.equal(updateThemeSettingsSchema.safeParse({
    typography: { fontHeading: 'serif; color: red' },
  }).success, false);
  assert.equal(updateThemeSettingsSchema.safeParse({
    typography: { bodyLineHeight: 4 },
  }).success, false);
});

test('visibilitas bio kedua mempelai menerima nilai boolean', () => {
  assert.equal(updateThemeSettingsSchema.safeParse({ brideBioEnabled: true, groomBioEnabled: false }).success, true);
  assert.equal(updateThemeSettingsSchema.safeParse({ brideBioEnabled: 'ya' }).success, false);
});

test('layout galeri hanya menerima pilihan yang didukung', () => {
  assert.equal(updateThemeSettingsSchema.safeParse({ galleryLayout: 'carousel' }).success, true);
  assert.equal(updateThemeSettingsSchema.safeParse({ galleryLayout: 'acak-sekali' }).success, false);
});

test('RSVP membatasi jumlah kehadiran maksimal dua orang', async () => {
  const { rsvpSchema } = await import('../src/utils/validators.js');
  assert.equal(rsvpSchema.safeParse({ attending: true, guestCount: 2 }).success, true);
  assert.equal(rsvpSchema.safeParse({ attending: true, guestCount: 3 }).success, false);
});

test('aturan bisnis RSVP menerima deadline, mode akses, dan batas per tamu', () => {
  assert.equal(updateInvitationSchema.safeParse({ rsvpOpenToPublic: false, rsvpDeadline: '2026-12-01T10:00:00Z' }).success, true);
  assert.equal(guestSchema.safeParse({ name: 'Tamu', paxLimit: 2 }).success, true);
  assert.equal(guestSchema.safeParse({ name: 'Tamu', paxLimit: 3 }).success, false);
});

test('hadiah mendukung beberapa rekening tervalidasi', () => {
  const value = { type: 'both', shippingAddress: 'Alamat lengkap', bankAccounts: [
    { bankName: 'BCA', accountNumber: '123', accountHolder: 'Aisyah' },
    { bankName: 'Mandiri', accountNumber: '456', accountHolder: 'Auf' },
  ] };
  assert.equal(giftSettingsSchema.safeParse(value).success, true);
});

test('fitur ucapan tetap dikendalikan dari Susunan dan Blok', () => {
  assert.equal(invitationFeaturesSchema.safeParse({ rsvpEnabled: false, wishesEnabled: true }).success, true);
});

test('typography accepts scalable type and reset mode while rejecting unsafe size ranges',()=>{
  assert.equal(updateThemeSettingsSchema.safeParse({typography:{fontHeading:'Dancing Script',fontBody:'Lora',headingScale:.75,bodyScale:1.15,metricsMode:'custom',headingLineHeight:1.2,bodyLetterSpacing:.02}}).success,true);
  assert.equal(updateThemeSettingsSchema.safeParse({typography:{headingScale:3}}).success,false);
  assert.equal(updateThemeSettingsSchema.safeParse({typography:{bodyScale:.2}}).success,false);
  assert.equal(updateThemeSettingsSchema.safeParse({typography:{metricsMode:'template',headingScale:1,bodyScale:1}}).success,true);
});

test('gift settings require complete details for the selected receiving methods',()=>{
 assert.equal(giftSettingsSchema.safeParse({type:'address',shippingAddress:'Alamat'}).success,true);
 assert.equal(giftSettingsSchema.safeParse({type:'address',shippingAddress:''}).success,false);
 assert.equal(giftSettingsSchema.safeParse({type:'bank_transfer',bankAccounts:[]}).success,false);
 assert.equal(giftSettingsSchema.safeParse({type:'both',bankAccounts:[{bankName:'BCA',accountNumber:'001',accountHolder:'Uji'}],shippingAddress:'Alamat'}).success,true);
});
test('RSVP subscopes and closing character controls accept bounded settings',()=>{
 assert.equal(updateThemeSettingsSchema.safeParse({typography:{sections:{wishList:{bodyScale:1.2},rsvp:{formWidth:.85,formGap:18}}},characterSettings:{mode:'default',separatePose:false,cover:{scale:1,x:0,y:0},hero:{scale:1,x:0,y:0},closing:{scale:.6,x:100,y:-30}}}).success,true);
 assert.equal(updateThemeSettingsSchema.safeParse({typography:{sections:{rsvp:{formWidth:3}}}}).success,false);
});
