import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOtpRecord,
  generateOTP,
  generateResetToken,
  hashResetToken,
  verifyOtpRecord,
} from '../src/utils/authTokens.js';

test('OTP selalu enam digit', () => {
  assert.match(generateOTP(), /^\d{6}$/);
});

test('OTP valid sebelum kedaluwarsa dan ditolak setelahnya', () => {
  const record = createOtpRecord('123456', 1_000, 10_000);
  assert.equal(verifyOtpRecord(record, '123456', 5_000), true);
  assert.equal(verifyOtpRecord(record, '654321', 5_000), false);
  assert.equal(verifyOtpRecord(record, '123456', 11_001), false);
});

test('token reset acak disimpan sebagai hash', () => {
  const token = generateResetToken();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.match(hashResetToken(token), /^[a-f0-9]{64}$/);
  assert.notEqual(hashResetToken(token), token);
});
