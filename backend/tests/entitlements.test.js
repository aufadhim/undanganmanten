import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEntitlements, getEntitlements } from '../src/utils/entitlements.js';

test('Trial mendapat kuota dasar serta seluruh section preview', () => {
  assert.deepEqual(calculateEntitlements('TRIAL'), {
    maxGallery: 10,
    maxGuests: 10,
    qrGuestbook: false,
    giftEnabled: true,
    livestreamEnabled: true,
  });
});

test('Standard mendapat section lengkap dan add-on menambah kuota', () => {
  assert.deepEqual(calculateEntitlements('STANDARD', [
    'EXTRA_GALLERY_10',
    'EXTRA_GUESTS_100',
    'AMPLOP_DIGITAL',
  ]), {
    maxGallery: 20,
    maxGuests: 200,
    qrGuestbook: false,
    giftEnabled: true,
    livestreamEnabled: true,
  });
});

test('Premium memiliki tamu tanpa batas dan fitur lengkap', () => {
  assert.deepEqual(calculateEntitlements('PREMIUM'), {
    maxGallery: 30,
    maxGuests: null,
    qrGuestbook: false,
    giftEnabled: true,
    livestreamEnabled: true,
  });
});

 test('QR guestbook only activates through its addon',()=>{assert.equal(calculateEntitlements('PREMIUM').qrGuestbook,false);assert.equal(calculateEntitlements('STANDARD',['QR_GUESTBOOK']).qrGuestbook,true)});

test('Standard keeps its quota when the wedding has a Premium design and QR', async () => {
  const db = {
    order: { findMany: async () => [] },
    weddingAddon: { findUnique: async () => ({ revokedAt: null }) },
    invitation: { findMany: async () => [{ packageType: 'PREMIUM' }] },
  };
  const result = await getEntitlements({ id: 'standard', weddingId: 'wedding', packageType: 'STANDARD' }, db);
  assert.equal(result.maxGallery, 10);
  assert.equal(result.maxGuests, 100);
  assert.equal(result.qrGuestbook, true);
});
