import crypto from 'crypto';

export const DEFAULT_OTP_TTL_MS = 10 * 60 * 1000;

export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function createOtpRecord(otp, now = Date.now(), ttlMs = DEFAULT_OTP_TTL_MS) {
  return `${otp}:${now + ttlMs}`;
}

export function verifyOtpRecord(record, otp, now = Date.now()) {
  const [storedOtp, expiresAt] = String(record || '').split(':');
  return storedOtp === otp && Number(expiresAt) > now;
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
