import { test, expect } from '@playwright/test';

test.describe('Public Invitation Flow', () => {
  let testEmail = `public_${Date.now()}@test.com`;
  let slug = '';

  test.beforeAll(async ({ request }) => {
    // Signup by API
    await request.post('http://127.0.0.1:4000/api/auth/signup', {
      data: { email: testEmail, password: 'Password123!', phone: '08123' }
    });
    // Verify OTP by API
    const verifyRes = await request.post('http://127.0.0.1:4000/api/auth/verify-email', {
      data: { email: testEmail, otp: '123456' }
    });
    const token = (await verifyRes.json()).token;

    // Ambil slug dari data undangan yang otomatis terbuat
    const inviteRes = await request.get('http://127.0.0.1:4000/api/invitations/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await inviteRes.json();
    slug = data.invitation.slug;
  });

  test.afterAll(async ({ request }) => {
    await request.post('http://127.0.0.1:4000/api/auth/test-reset');
  });

  test('Guest can open invitation, RSVP and send wish', async ({ page }) => {
    // 1. Buka halaman undangan
    await page.goto(`/i/${slug}`);
    
    // 2. Klik Buka Undangan (Cover)
    await page.click('button:has-text("Buka Undangan")');
    await expect(page.locator('.invite-container')).toBeVisible();

    // 3. Isi RSVP
    await page.fill('input[placeholder="Nama Anda"]', 'Budi Tamu');
    await page.selectOption('select', 'true'); // Attending
    await page.click('button:has-text("Kirim Konfirmasi")');
    
    // Tunggu pesan sukses RSVP
    await expect(page.locator('text=Konfirmasi kehadiran Anda telah tersimpan')).toBeVisible();

    // 4. Kirim Ucapan
    // Ada dua input placeholder "Nama Anda", satu di RSVP, satu di Wishes.
    // RSVP form menghilang setelah dikirim, jadi input "Nama Anda" tinggal satu.
    await page.fill('input[placeholder="Nama Anda"]', 'Budi Tamu');
    await page.fill('textarea[placeholder="Berikan ucapan dan doa terbaik untuk pengantin..."]', 'Selamat menempuh hidup baru!');
    await page.click('button:has-text("Kirim Ucapan")');

    // Cek ucapan muncul
    await expect(page.locator('text=Selamat menempuh hidup baru!')).toBeVisible();
  });
});
