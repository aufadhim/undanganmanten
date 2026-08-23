import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `user_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  test.beforeAll(async ({ request }) => {
    // Reset data (opsional, endpoint ini sudah menghapus semua yang berakhiran @test.com)
    await request.post('http://127.0.0.1:4000/api/auth/test-reset');
  });

  test('User can sign up, verify OTP, and login', async ({ page }) => {
    // 1. Signup
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[type="tel"]', '08123456789');
    await page.click('button[type="submit"]');

    // Tunggu navigasi ke halaman OTP
    await expect(page).toHaveURL(/.*\/verify-otp/);

    // 2. Isi OTP Bypass (123456)
    // Asumsi ada 6 input box untuk OTP
    const otpInputs = page.locator('.otp-input');
    await expect(otpInputs).toHaveCount(6);
    const otp = '123456';
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(otp[i]);
    }

    // Klik tombol verifikasi (biasanya otomatis, tapi kalau butuh submit)
    const verifyBtn = page.locator('button:has-text("Verifikasi")');
    if (await verifyBtn.isVisible()) {
      await verifyBtn.click();
    }

    // Harusnya redirect ke dashboard atau login. Di sistem ini sepertinya login
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Logout
    await page.click('button:has-text("Keluar")');
    await expect(page).toHaveURL('/');

    // 3. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
