#!/usr/bin/env node

require('dotenv').config();

const puppeteer = require('puppeteer-core');
const { Cluster } = require('puppeteer-cluster');
const fs = require('fs').promises;
const path = require('path');
const glob = require('fast-glob');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: 5,
    workerCreationDelay: 1000,
    retryLimit: 5,
    retryDelay: 10000,
    timeout: 50000,
    monitor: true,
    puppeteer: puppeteer,
    puppeteerOptions: {
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
  });

  await cluster.task(async ({ page, data: resourcePath }) => {
    await page.setViewport({
      width: 1440,
      height: 800,
      deviceScaleFactor: 1,
    });
    await page.setDefaultNavigationTimeout(50000);

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
    if (fileExists) {
      // TODO: automate opengraph image update if new content in sub elements
      // const lastModified = await fs.stat(file).then((stats) => stats.mtimeMs);
      // const ageInDays = (new Date().getTime() - lastModified) / ONE_DAY_IN_MS;
      // if (resourcePath.match(/^photos\//) || ageInDays < 14) {
      // Renew galleries' opengraph images after 14 days
      return;
      // }
    }

    const opengraphUrl = `http://localhost:8080/${resourcePath}/opengraph.html`;

    console.log(`Get opengraph image from ${opengraphUrl}`);

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

  // Get the list of photos
  const photos = await glob(['collections/photos/*'], {
		cwd: 'src',
		onlyDirectories: true,
	});

  // Get the list of galleries
  const galleries = await glob(['pages/galleries/**'], {
		cwd: 'src',
		onlyDirectories: true,
	});

  // Queue processing of all photos and galleries
  [...photos, ...galleries].forEach((resourcePath) =>
    cluster.queue(resourcePath)
  );

  await cluster.idle();
  await cluster.close();
})();
