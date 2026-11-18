import { test, expect } from '@playwright/test';

const ACTIVE_TEMPLATES = [
  ['eternal', '.eternal-wrapper'],
  ['seraya', '.seraya'],
  ['nawasena', '.nawasena'],
];

for (const [themeId, rootSelector] of ACTIVE_TEMPLATES) {
  test(`${themeId} lolos smoke QA di Mode Coba`, async ({ page }) => {
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));

    await page.goto(`/sandbox?theme=${themeId}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const root = page.locator(rootSelector);
    await expect(root).toBeVisible();
    await expect(page.locator('.theme-grid > div')).toHaveCount(7);

    const opener = root.getByRole('button', { name: /buka (undangan|invitation)|enter the evening/i }).first();
    await expect(opener).toBeVisible();
    await opener.click();

    const metrics = await root.evaluate((element) => {
      const sections = [...element.querySelectorAll('[data-section]')];
      const visibleSections = sections.filter((section) => {
        const style = getComputedStyle(section);
        const bounds = section.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0;
      });
      return {
        horizontalOverflow: element.scrollWidth - element.clientWidth,
        sectionCount: sections.length,
        visibleSectionCount: visibleSections.length,
        visibleTextLength: element.innerText.trim().length,
      };
    });

    expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(metrics.sectionCount).toBeGreaterThanOrEqual(5);
    expect(metrics.visibleSectionCount).toBe(metrics.sectionCount);
    expect(metrics.visibleTextLength).toBeGreaterThan(500);

    const brokenImages = await root.locator('img[src]:not([src=""])').evaluateAll((images) => images
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')));
    expect(brokenImages).toEqual([]);

    for (const device of ['Mobile', 'iPad', 'iPad Pro', 'Desktop']) {
      await page.getByTitle(device, { exact: true }).click();
      const previewMetrics = await root.evaluate((element) => ({
        horizontalOverflow: element.scrollWidth - element.clientWidth,
        width: element.clientWidth,
      }));
      expect(previewMetrics.width).toBeGreaterThan(0);
      expect(previewMetrics.horizontalOverflow).toBeLessThanOrEqual(1);
    }

    expect(runtimeErrors).toEqual([]);
  });
}

test('tema development tidak dapat dipaksa melalui URL Mode Coba', async ({ page }) => {
  await page.goto('/sandbox?theme=daguerre');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('.eternal-wrapper')).toBeVisible();
  await expect(page.locator('.atelier-daguerre')).toHaveCount(0);
});

test('dashboard menormalkan theme ID development dari backend ke Eternal', async ({ page }) => {
  await page.route('**/api/invitations', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        invitations: [{
          id: 'legacy-hidden-theme',
          slug: 'legacy-hidden-theme',
          themeId: 'daguerre',
          status: 'draft',
          packageType: 'TRIAL',
          weddingDate: '2027-12-31',
          coupleProfile: { brideName: 'Arunika', groomName: 'Deva' },
          themeSettings: {},
          invitationFeatures: {},
          events: [],
          galleryMedia: [],
        }],
      }),
    });
  });
  await page.addInitScript(() => localStorage.setItem('um_token', 'qa-template-token'));
  await page.goto('/dashboard');

  await expect(page.locator('.eternal-wrapper')).toBeVisible();
  await expect(page.locator('.atelier-daguerre')).toHaveCount(0);
});
