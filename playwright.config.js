const { devices } = require('@playwright/test');

const config = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:8080',
    // headless: false,
    viewport: { width: 1280, height: 720 },
    javaScriptEnabled: false,
    trace: 'on',
    // video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'iPhone 11',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 11'],
      },
    },
  ],
  expect: {
    toHaveScreenshot: { maxDiffPixels: 1000 },
  },
};

module.exports = config;
