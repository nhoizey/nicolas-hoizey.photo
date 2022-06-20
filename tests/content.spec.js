const { test, expect } = require('@playwright/test');

const pages = {
  home: '/',
  blog: '/blog/',
  blog_post: '/blog/2022/02/16/exhibition-in-draveil-regards-multiples/',
};

for (const pageName in pages) {
  test(pageName, async ({ page }) => {
    await page.goto(pages[pageName]);
    await expect(page).toHaveScreenshot(`${pageName}.png`, {animations: 'disabled'});
  })
}
