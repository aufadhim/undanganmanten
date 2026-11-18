import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:4010/api';

async function createUser(request, prefix) {
  const email = `${prefix}_${Date.now()}@test.com`;
  const password = 'Password123!';
  await request.post(`${API}/auth/signup`, { data: { email, password, phone: '08123' } });
  const verified = await request.post(`${API}/auth/verify-email`, { data: { email, otp: '123456' } });
  return { email, token: (await verified.json()).token };
}

test('dashboard memuat undangan milik pengguna', async ({ page, request }) => {
  const user = await createUser(request, 'dashboard');
  const created = await request.post(`${API}/invitations`, {
    headers: { Authorization: `Bearer ${user.token}` },
    data: { brideName: 'Siti', groomName: 'Budi', weddingDate: '2027-12-31', themeId: 'samaya' },
  });
  expect(created.ok()).toBeTruthy();

  await page.addInitScript((token) => localStorage.setItem('um_token', token), user.token);
  await page.goto('/dashboard');
  await expect(page.getByText(/Siti & Budi/).first()).toBeVisible();

  await request.delete(`${API}/auth/delete-account`, { headers: { Authorization: `Bearer ${user.token}` }, data: { confirmationEmail: user.email } });
});
