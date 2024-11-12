#!/usr/bin/env node

// Load .env variables with dotenv
import {} from "dotenv/config";

import { access, stat } from "node:fs/promises";
import path from "node:path";
import glob from "fast-glob";
import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-core";

(async () => {
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_BROWSER,
		maxConcurrency: 3,
		workerCreationDelay: 1000,
		retryLimit: 3,
		retryDelay: 5000,
		timeout: 50000,
		monitor: true,
		puppeteer: puppeteer,
		puppeteerOptions: {
			executablePath:
				"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		},
	});

	await cluster.task(async ({ page, data: resourcePath }) => {
		await page.setViewport({
			width: 1200,
			height: 800,
			deviceScaleFactor: 1.5,
		});
		await page.setDefaultNavigationTimeout(50000);

		const folder = path.join("./src/collections", resourcePath);
		const stats = await stat(folder);
		const isDir = await stats.isDirectory();
		if (!isDir) {
			return;
		}

		const file = path.join(folder, "map.png");
		const fileExists = await access(file)
			.then(() => true)
			.catch(() => false);
		if (fileExists) return;

		const photoUrl = `http://localhost:8080/${resourcePath}/`;

		console.log(`Get map image from ${photoUrl}`);

		await page.goto(photoUrl, { waitUntil: "networkidle0", timeout: 0 });

		// Remove marker and its shadow
		const markerShadow = await page.$("#map .marker-shadow");
		if (markerShadow) {
			await markerShadow.evaluate((node) =>
				node.parentElement.removeChild(node),
			);
		}
		const marker = await page.$("#map .marker");
		if (marker) {
			await marker.evaluate((node) => node.parentElement.removeChild(node));
		}

		// Take a screenshot of the map
		const map = await page.$("#map img");
		if (map) {
			await map.screenshot({ path: file, type: "png" });
		}
	});

	// In case of problems, log them
	cluster.on("taskerror", (err, data) => {
		console.log(`  Error with ${data}: ${err.message}`);
	});

	// Get the list of photos
	const photos = await glob(["photos/*"], {
		cwd: "src/collections/",
		onlyDirectories: true,
	});

	// Queue processing of all photos and galleries
	for (const resourcePath of photos) {
		cluster.queue(resourcePath);
	}

	await cluster.idle();
	await cluster.close();
})();
