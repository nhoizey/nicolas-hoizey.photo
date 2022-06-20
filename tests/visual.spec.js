const { test, expect } = require('@playwright/test');

const pages = {
  home: '/',
  galleries: '/galleries/',
  gallery: '/galleries/travels/europe/georgia/',
  photo_portrait: '/galleries/travels/europe/georgia/faded-blue/',
  photo_landscape: '/galleries/travels/europe/georgia/kaleidoscope-house/',
  blog: '/blog/',
  blog_post: '/blog/2022/02/16/exhibition-in-draveil-regards-multiples/',
};

for (const pageName in pages) {
  test(`[JS off] ${pageName}`, async ({ page }) => {
    await page.goto(pages[pageName]);
    await expect(page).toHaveScreenshot(`${pageName}.png`, {animations: 'disabled'});
  })
}
