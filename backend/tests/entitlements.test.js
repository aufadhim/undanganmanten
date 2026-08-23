import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEntitlements } from '../src/utils/entitlements.js';

test('Trial hanya mendapat kuota dasar dan fitur gratis', () => {
  assert.deepEqual(calculateEntitlements('TRIAL'), {
    maxGallery: 10,
    maxGuests: 10,
    giftEnabled: false,
    livestreamEnabled: false,
  });
});

test('Standard dapat menerima seluruh add-on yang dibeli', () => {
  assert.deepEqual(calculateEntitlements('STANDARD', [
    'EXTRA_GALLERY_10',
    'EXTRA_GUESTS_100',
    'AMPLOP_DIGITAL',
  ]), {
    maxGallery: 20,
    maxGuests: 200,
    giftEnabled: true,
    livestreamEnabled: false,
  });
});

test('Premium memiliki tamu tanpa batas dan fitur lengkap', () => {
  assert.deepEqual(calculateEntitlements('PREMIUM'), {
    maxGallery: 30,
    maxGuests: null,
    giftEnabled: true,
    livestreamEnabled: true,
  });
});
