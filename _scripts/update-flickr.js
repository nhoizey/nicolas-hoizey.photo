// Load .env variables with dotenv
import {} from "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import slugify from "../src/_11ty/_utils/slugify.js";

import { createFlickr } from "flickr-sdk";
const { flickr } = createFlickr(process.env.FLICKR_CONSUMER_KEY);

const PLATFORMS_FILE = "src/_data/platforms.json";
import platformsData from "../src/_data/platforms.json" with { type: "json" };

const syncFlickr = async () => {
	const flickrIds = {};
	for (const slug in platformsData) {
		if (platformsData[slug].flickr) {
			flickrIds[platformsData[slug].flickr.id] = slug;
		}
	}

	const flickrPhotos = await flickr("flickr.people.getPublicPhotos", {
		user_id: process.env.FLICKR_USER_ID,
		extras: "count_views,count_faves,count_comments",
		per_page: 500,
	}).then((body) => body.photos.photo);

	for (const photo of flickrPhotos) {
		// console.dir(photo);

		const views = Number.parseInt(photo.count_views, 10);
		const faves = Number.parseInt(photo.count_faves, 10);
		const comments = Number.parseInt(photo.count_comments, 10);

		if (Object.hasOwn(flickrIds, photo.id)) {
			platformsData[flickrIds[photo.id]].flickr.views = views;
			platformsData[flickrIds[photo.id]].flickr.faves = faves;
			platformsData[flickrIds[photo.id]].flickr.comments = comments;
		} else {
			const flickrSlug = slugify(photo.title);
			if (Object.hasOwn(platformsData, flickrSlug)) {
				platformsData[flickrSlug].flickr = {
					id: photo.id,
					views: views,
					faves: faves,
					comments: comments,
				};
			} else {
				if (fs.existsSync(`./src/collections/photos/${flickrSlug}`)) {
					platformsData[flickrSlug] = {
						flickr: {
							id: photo.id,
							views: views,
							faves: faves,
							comments: comments,
						},
					};
					console.log(
						`Adding Flickr photo "${photo.title}" (slug "${flickrSlug}")
-> https://www.flickr.com/photos/nicolas-hoizey/${photo.id}
`,
					);
				} else {
					console.log(
						`Couldn't find Flickr photo "${photo.title}" here (slug "${flickrSlug}")
-> https://www.flickr.com/photos/nicolas-hoizey/${photo.id}
`,
					);
				}
			}
		}
	}
};

syncFlickr().then(() => {
	// Todo after everything else
	fs.writeFileSync(
		path.join(".", PLATFORMS_FILE),
		JSON.stringify(platformsData, null, 2),
		{
			encoding: "utf8",
		},
	);
});
