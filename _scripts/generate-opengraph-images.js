#!/usr/bin/env node

require('dotenv').config();

const puppeteer = require('puppeteer-core');
const { Cluster } = require('puppeteer-cluster');
const fs = require('fs').promises;
const path = require('path');

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 5,
    monitor: true,
    puppeteer: puppeteer,
    puppeteerOptions: {
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
  });

  await cluster.task(async ({ page, data: resourcePath }) => {
    const folder = path.join('./src', resourcePath);
    const isDir = await fs.stat(folder).then((stats) => stats.isDirectory());
    if (!isDir) {
      return;
    }

    const file = path.join(folder, 'opengraph.jpg');
    const fileExists = await fs
      .access(file)
      .then(() => true)
      .catch(() => false);
    if (fileExists) return;

    const opengraphUrl = `https://nicolas-hoizey.photo/${resourcePath}/opengraph.html`;

    console.log(`Get opengraph image for ${opengraphUrl}`);

    await page.setViewport({
      width: 1440,
      height: 800,
      deviceScaleFactor: 1,
    });
    await page.goto(opengraphUrl, { waitUntil: 'networkidle0', timeout: 0 });

    // Save a screenshot of the opengraph image
    const element = await page.$('#opengraph');
    if (element) {
      await element.screenshot({
        path: file,
        type: 'jpeg',
      });
    }
  });

  // In case of problems, log them
  cluster.on('taskerror', (err, data) => {
    console.log(`  Error with ${data}: ${err.message}`);
  });

  const photos = await fs.readdir('./src/photos/');
  photos.forEach((photo) => cluster.queue(path.join('photos', photo)));

  await cluster.idle();
  await cluster.close();
})();
