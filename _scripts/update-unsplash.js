// Load .env variables with dotenv
import {} from "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";
import { createApi } from "unsplash-js";

const PLATFORMS_FILE = "src/_data/platforms.json";
import platformsData from "../src/_data/platforms.json" with { type: "json" };

const syncUnsplash = async () => {
	const unsplashIds = {};
	for (const slug in platformsData) {
		if (platformsData[slug].unsplash) {
			unsplashIds[platformsData[slug].unsplash.id] = slug;
		}
	}

	const unsplash = createApi({
		accessKey: process.env.UNSPLASH_ACCESS_KEY,
		fetch: fetch,
	});

	const numberOfPhotos = await unsplash.users
		.get({ username: "nhoizey" })
		.then((result) => {
			if (result.errors) {
				console.log("error occurred: ", result.errors[0]);
				return 0;
			}
			return result.response.total_photos;
		});

	if (numberOfPhotos > 0) {
		let unsplashPhotos = [];

		for (let page = 1; page <= Math.ceil(numberOfPhotos / 30); page++) {
			await unsplash.users
				.getPhotos({
					username: "nhoizey",
					perPage: 30,
					page: page,
					stats: true,
					resolution: "days",
					quantity: 1,
				})
				.then((result) => {
					if (result.errors) {
						console.log("error occurred: ", result.errors[0]);
					} else {
						const { total, results } = result.response;
						unsplashPhotos = [...unsplashPhotos, ...results];
					}
				});
		}

		for (const photo of unsplashPhotos) {
			const downloads = photo.statistics.downloads.total;
			const views = photo.statistics.views.total;
			if (Object.hasOwn(unsplashIds, photo.id)) {
				platformsData[unsplashIds[photo.id]].unsplash.downloads = downloads;
				platformsData[unsplashIds[photo.id]].unsplash.views = views;
			}
		}
	}
};

syncUnsplash().then(() => {
	// Todo after everything else
	fs.writeFileSync(
		path.join(".", PLATFORMS_FILE),
		JSON.stringify(platformsData, null, 2),
		{
			encoding: "utf8",
		},
	);
});
