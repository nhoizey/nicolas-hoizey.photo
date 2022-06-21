const { devices } = require('@playwright/test');

const config = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 5 : 2,
  timeout: 5 * 60 * 1000, // 5 minutes
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:8080/',
    timeout: 10 * 60 * 1000, // 10 minutes
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:8080',
    // headless: false,
    viewport: { width: 1280, height: 720 },
    javaScriptEnabled: true,
    // trace: 'on',
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
    timeout: 3 * 60 * 1000, // 3 minutes
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
};

module.exports = config;
