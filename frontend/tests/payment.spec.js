import { test, expect } from '@playwright/test';

test('halaman login tidak memuat Midtrans sebelum checkout', async ({ page }) => {
  const snapRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('midtrans.com/snap')) snapRequests.push(request.url());
  });
  await page.goto('/login');
  await expect(page.getByRole('heading')).toBeVisible();
  expect(snapRequests).toHaveLength(0);
});
