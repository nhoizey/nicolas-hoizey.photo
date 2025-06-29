// Load .env variables with dotenv

import fs from "node:fs";
import path from "node:path";
// biome-ignore lint/correctness/noUnusedImports: dotenv
import {} from "dotenv/config";
import { createRestAPIClient } from "masto";
import slugify from "../src/_11ty/_utils/slugify.js";

const PLATFORMS_FILE = "src/_data/platforms.json";

import platformsData from "../src/_data/platforms.json" with { type: "json" };

const STATUSES_PER_API_CALL = 20;

const syncPixelfed = async () => {
	const pixelfedIds = {};
	for (const slug in platformsData) {
		if (platformsData[slug].pixelfed) {
			if (platformsData[slug].pixelfed.id) {
				pixelfedIds[platformsData[slug].pixelfed.id] = slug;
			} else {
				if (Array.isArray(platformsData[slug].pixelfed)) {
					for (const item of platformsData[slug].pixelfed) {
						pixelfedIds[item.id] = slug;
					}
					platformsData[slug].pixelfed = [];
				}
			}
		}
	}

	const masto = createRestAPIClient({
		url: process.env.PIXELFED_URL,
		accessToken: process.env.PIXELFED_TOKEN,
		disableVersionCheck: true,
	});

	const me = await masto.v1.accounts.verifyCredentials();

	let lastCallLength = -1;
	let lastId = null;

	while (lastCallLength !== 0) {
		const options = {
			only_media: true,
			exclude_replies: true,
			exclude_reblogs: true,
			limit: STATUSES_PER_API_CALL,
		};
		if (lastId) {
			options.max_id = lastId;
		}

		let pixelfedPhotos;
		try {
			pixelfedPhotos = await masto.v1.accounts
				.$select(me.id)
				.statuses.list(options);
		} catch (error) {
			console.dir(error);
		}

		// console.dir(pixelfedPhotos);

		lastCallLength = pixelfedPhotos.length;

		if (lastCallLength !== 0) {
			for (const photo of pixelfedPhotos) {
				// console.log(photo.url);
				lastId = photo.id;

				const faves = Number.parseInt(photo.favouritesCount, 10);
				const reblogs = Number.parseInt(photo.reblogsCount, 10);

				if (Object.hasOwn(pixelfedIds, photo.id)) {
					platformsData[pixelfedIds[photo.id]].pixelfed.push({
						id: photo.id,
						faves: faves,
						reblogs: reblogs,
					});
					// if (platformsData[pixelfedIds[photo.id]].pixelfed.length > 1) {
					//   console.log(
					//     `${
					//       platformsData[pixelfedIds[photo.id]].pixelfed.length
					//     } posts for "${pixelfedIds[photo.id]}"`
					//   );
					// }
				} else {
					const titleRegex = /^["“”]([^"“”]+)["“”](.|\n)*$/m;
					const matches = photo.content.match(titleRegex);
					if (matches) {
						const title = matches[1];
						const pixelfedSlug = slugify(title);
						if (Object.hasOwn(platformsData, pixelfedSlug)) {
							platformsData[pixelfedSlug].pixelfed = [
								{
									id: photo.id,
									faves: faves,
									reblogs: reblogs,
								},
							];
						} else {
							if (fs.existsSync(`./src/collections/photos/${pixelfedSlug}`)) {
								platformsData[pixelfedSlug] = {
									pixelfed: [
										{
											id: photo.id,
											faves: faves,
											reblogs: reblogs,
										},
									],
								};
							} else {
								console.log(
									`Couldn't find Pixelfed photo titled "${title}" here: ${photo.url}`,
								);
							}
						}
					} else {
						console.log(`No title found for ${photo.url}`);
					}
				}
			}
		}
	}
};

syncPixelfed().then(() => {
	// Todo after everything else
	fs.writeFileSync(
		path.join(".", PLATFORMS_FILE),
		JSON.stringify(platformsData, null, 2),
		{
			encoding: "utf8",
		},
	);
});
