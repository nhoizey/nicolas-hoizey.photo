require('dotenv').config();

import fs from 'node:fs';
import path from 'node:path';
const nodeFetch = require('node-fetch');
const { createApi } = require('unsplash-js');

const PLATFORMS_FILE = 'src/_data/platforms.json';
let platformsData = require(path.join('..', PLATFORMS_FILE));

const syncUnsplash = async () => {
	let unsplashIds = {};
	for (const slug in platformsData) {
		if (platformsData[slug].unsplash) {
			unsplashIds[platformsData[slug].unsplash.id] = slug;
		}
	}

	const unsplash = createApi({
		accessKey: process.env.UNSPLASH_ACCESS_KEY,
		fetch: nodeFetch,
	});

	let numberOfPhotos = await unsplash.users
		.get({ username: 'nhoizey' })
		.then((result) => {
			if (result.errors) {
				console.log('error occurred: ', result.errors[0]);
				return 0;
			} else {
				return result.response.total_photos;
			}
		});

	if (numberOfPhotos > 0) {
		let unsplashPhotos = [];

		for (page = 1; page <= Math.ceil(numberOfPhotos / 30); page++) {
			await unsplash.users
				.getPhotos({
					username: 'nhoizey',
					perPage: 30,
					page: page,
					stats: true,
					resolution: 'days',
					quantity: 1,
				})
				.then((result) => {
					if (result.errors) {
						console.log('error occurred: ', result.errors[0]);
					} else {
						const { total, results } = result.response;
						unsplashPhotos = [...unsplashPhotos, ...results];
					}
				});
		}

		unsplashPhotos.forEach((photo) => {
			const downloads = photo.statistics.downloads.total;
			const likes = photo.statistics.likes.total;
			const views = photo.statistics.views.total;
			if (unsplashIds.hasOwnProperty(photo.id)) {
				platformsData[unsplashIds[photo.id]].unsplash.downloads = downloads;
				platformsData[unsplashIds[photo.id]].unsplash.likes = likes;
				platformsData[unsplashIds[photo.id]].unsplash.views = views;
			}
		});
	}
};

syncUnsplash().then(() => {
	// Todo after everything else
	fs.writeFileSync(
		path.join('.', PLATFORMS_FILE),
		JSON.stringify(platformsData, null, 2),
		{
			encoding: 'utf8',
		}
	);
});
