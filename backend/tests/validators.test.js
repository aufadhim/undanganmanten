import test from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, resetPasswordSchema, signupSchema, updateThemeSettingsSchema } from '../src/utils/validators.js';
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

test('RSVP membatasi jumlah kehadiran maksimal dua orang', async () => {
  const { rsvpSchema } = await import('../src/utils/validators.js');
  assert.equal(rsvpSchema.safeParse({ attending: true, guestCount: 2 }).success, true);
  assert.equal(rsvpSchema.safeParse({ attending: true, guestCount: 3 }).success, false);
});
