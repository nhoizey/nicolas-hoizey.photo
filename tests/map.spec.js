const { test, expect } = require('@playwright/test');

test.use({ timeout: 50000 });

test('map', async ({ page }) => {
  await page.goto('/map/');
  await page.waitForRequest('/map/photos.geojson');
  await page.waitForTimeout(1000);
  await expect(page).toHaveScreenshot('map-default.png', {
    animations: 'disabled',
  });
});
