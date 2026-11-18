import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:4010/api';

test('pengguna dapat daftar, verifikasi OTP, logout, dan login kembali', async ({ page, request }) => {
  const email = `auth_${Date.now()}@test.com`;
  const password = 'Password123!';

  await page.goto('/signup');
  await page.locator('input[type="text"]').first().fill('Pengguna Test');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="tel"]').fill('08123456789');
  await page.locator('input[type="password"]').nth(0).fill(password);
  await page.locator('input[type="password"]').nth(1).fill(password);
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: /create account|daftar/i }).click();

  await page.getByPlaceholder('000000').fill('123456');
  await page.getByRole('button', { name: /verifikasi|verify/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole('button', { name: /keluar/i }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const token = await page.evaluate(() => localStorage.getItem('um_token'));
  await request.delete(`${API}/auth/delete-account`, { headers: { Authorization: `Bearer ${token}` }, data: { confirmationEmail: email } });
});

test('halaman pemulihan password menangani tautan tanpa token', async ({ page }) => {
  await page.goto('/forgot-password');
  await expect(page.getByRole('heading', { name: /lupa password/i })).toBeVisible();
  await page.goto('/reset-password');
  await expect(page.getByText(/tidak valid atau tidak lengkap/i)).toBeVisible();
});
