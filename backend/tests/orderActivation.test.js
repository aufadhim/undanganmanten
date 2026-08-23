import test from 'node:test';
import assert from 'node:assert/strict';
import { getPackageExpiresAt } from '../src/services/orderActivation.js';

test('masa aktif paket berakhir tepat 30 hari setelah acara', () => {
  assert.equal(
    getPackageExpiresAt('2026-10-01T00:00:00.000Z').toISOString(),
    '2026-10-31T00:00:00.000Z',
  );
});

test('tanggal acara yang tidak valid ditolak', () => {
  assert.throws(() => getPackageExpiresAt('bukan-tanggal'), /tidak valid/);
});
