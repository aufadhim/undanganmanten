import test from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, resetPasswordSchema, signupSchema } from '../src/utils/validators.js';
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
