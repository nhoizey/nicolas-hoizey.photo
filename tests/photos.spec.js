const { test, expect } = require('@playwright/test');

const pages = {
  gallery: '/galleries/travels/europe/georgia/',
  photo_portrait: '/galleries/travels/europe/georgia/faded-blue/',
  photo_landscape: '/galleries/travels/europe/georgia/kaleidoscope-house/',
};

for (const pageName in pages) {
  test(pageName, async ({ page }) => {
    await page.goto(pages[pageName]);
    await expect(page).toHaveScreenshot(`${pageName}.png`, {animations: 'disabled'});
  })
}
