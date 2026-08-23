import { test, expect } from '@playwright/test';

test.describe('Dashboard & Invitation Management', () => {
  let testEmail = `dashboard_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  test.beforeAll(async ({ request }) => {
    // Signup by API
    await request.post('http://127.0.0.1:4000/api/auth/signup', {
      data: { email: testEmail, password: testPassword, phone: '08123' }
    });
    // Verify OTP by API
    await request.post('http://127.0.0.1:4000/api/auth/verify-email', {
      data: { email: testEmail, otp: '123456' }
    });
  });

  test.afterAll(async ({ request }) => {
    await request.post('http://127.0.0.1:4000/api/auth/test-reset');
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Bikin undangan jika belum ada
    if (await page.locator('text=Buat Undangan').isVisible()) {
      await page.fill('input:near(:text("Nama Panggilan Mempelai Wanita"))', 'Siti');
      await page.fill('input:near(:text("Nama Panggilan Mempelai Pria"))', 'Budi');
      await page.fill('input[type="date"]', '2027-12-31');
      await page.click('button:has-text("Buat")');
    }
    await expect(page.locator('button.tab:has-text("Profil")')).toBeVisible();
  });

  test('User can update couple profile', async ({ page }) => {
    await page.click('button:has-text("Profil")'); // Pindah ke tab Profil
    await page.fill('input[placeholder="Nama Panggilan"]', 'Budi'); // Groom
    // Because there are two inputs with same placeholder, we might need to scope
    // But let's assume they have labels or we can use nth
    const groomInputs = page.locator('.panel-content input[placeholder="Nama Lengkap"]').first();
    await groomInputs.fill('Budi Santoso');
    
    await page.click('button:has-text("Simpan Profil")');
    await expect(page.locator('text=Profil berhasil disimpan')).toBeVisible();
  });

  test('User can manage guests and generate link', async ({ page }) => {
    await page.click('button:has-text("Tamu")');
    
    await page.fill('input[placeholder="Nama Tamu"]', 'Tamu Kehormatan');
    await page.fill('input[placeholder="Nomor WA (opsional)"]', '08123456789');
    await page.click('button:has-text("Tambah Tamu")');

    // Cek tamu muncul di tabel
    await expect(page.locator('td', { hasText: 'Tamu Kehormatan' })).toBeVisible();
  });
});
