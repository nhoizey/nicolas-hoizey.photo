const { test, expect } = require('@playwright/test');

test.use({ javaScriptEnabled: true, timeout: 50000 });

test('[JS on] map', async ({ page }) => {
  await page.goto('/map/');
  await page.waitForRequest('/map/photos.geojson');
  await page.waitForTimeout(1000);
  await expect(page).toHaveScreenshot('map-default.png', {
    animations: 'disabled',
  });
});
