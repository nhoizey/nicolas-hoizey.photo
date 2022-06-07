#!/usr/bin/env node

require('dotenv').config();

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SRC = './src/photos/';

async function syncOnePhoto(slug) {
  if (slug === '.DS_Store') return;

  const opengraphFile = path.join(SRC, slug, 'opengraph.jpg');
  if (fs.existsSync(opengraphFile)) return;

  console.log(`Get opengraph image for ${slug}`);

  const opengraphHtmlUrl = `https://nicolas-hoizey.photo/photos/${slug}/opengraph/`;
  const browser = await puppeteer.launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1440,
    height: 800,
    deviceScaleFactor: 1,
  });
  await page.goto(opengraphHtmlUrl, { waitUntil: 'load', timeout: 0 });

  // Take a screenshot of the opengraph image
  const opengraphElement = await page.$('#opengraph');
  if (opengraphElement) {
    const opengraphScreenshotResult = await opengraphElement.screenshot({
      path: opengraphFile,
      type: 'jpeg',
    });
  }

  await page.close();
  await browser.close();
}

async function syncAllPhotos() {
  await fs.readdirSync(SRC).reduce(async (accumulator, photo) => {
    return [...(await accumulator), await syncOnePhoto(photo)];
  }, Promise.resolve([]));
}

syncAllPhotos().then(() => {
  // Todo after everything else
  console.log('Done!');
});
