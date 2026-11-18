import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:4010/api';

test('undangan yang dipublikasikan dapat dibuka tanpa login', async ({ page, request }) => {
  const email = `public_${Date.now()}@test.com`;
  const password = 'Password123!';
  await request.post(`${API}/auth/signup`, { data: { email, password } });
  const verified = await request.post(`${API}/auth/verify-email`, { data: { email, otp: '123456' } });
  const token = (await verified.json()).token;
  const headers = { Authorization: `Bearer ${token}` };
  const created = await request.post(`${API}/invitations`, {
    headers,
    data: { brideName: 'Aisyah', groomName: 'Auf', weddingDate: '2027-12-31', themeId: 'samaya' },
  });
  const invitation = (await created.json()).invitation;
  await request.post(`${API}/invitations/me/events`, {
    headers: { ...headers, 'x-invitation-id': invitation.id },
    data: { type: 'akad', date: '2027-12-31', venueName: 'Gedung Test' },
  });
  await request.patch(`${API}/invitations/${invitation.id}`, { headers, data: { status: 'published' } });

  await page.goto(`/${invitation.slug}`);
  await expect(page.getByText('Aisyah').first()).toBeVisible();
  await expect(page.getByText('Auf').first()).toBeVisible();

  await request.delete(`${API}/auth/delete-account`, { headers, data: { confirmationEmail: email } });
});
