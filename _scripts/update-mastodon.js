// Load .env variables with dotenv

import fs from "node:fs";
import path from "node:path";
// biome-ignore lint/correctness/noUnusedImports: dotenv
import {} from "dotenv/config";
import { createRestAPIClient } from "masto";

const PLATFORMS_FILE = "src/_data/platforms.json";

import posseData from "../cache/posse-mastodon-photo.json" with {
	type: "json",
};
import platformsData from "../src/_data/platforms.json" with { type: "json" };

const syncMastodon = async () => {
	const masto = createRestAPIClient({
		url: process.env.MASTODON_INSTANCE,
		accessToken: process.env.MASTODON_ACCESS_TOKEN,
		disableVersionCheck: true,
		// log: "debug",
	});

	loop: for (const url in posseData) {
		const slug = url.split("/").slice(-2, -1)[0];
		const newMastodon = [];

		for (const postUrl of posseData[url].toots) {
			const postId = postUrl.split("/").pop();
			let mastodonPost;
			try {
				mastodonPost = await masto.v1.statuses.$select(`${postId}`).fetch();

				newMastodon.push({
					id: `${postId}`,
					faves: mastodonPost.favouritesCount,
					reblogs: mastodonPost.reblogsCount,
				});
			} catch (error) {
				switch (error.statusCode) {
					case 429:
						// Stop calling the API if there's a "Too many requests" error
						console.log(`
Too many request, aborting…`);
						break loop;
					case 404:
						console.log(`
Missing toot: ${postUrl}`);
						break;
					default:
						console.log('--------------------------------------------');
						console.dir(error);
				}
			}

			if (platformsData[slug] !== undefined) {
				// Only use new data if there is some, meaning calling the API worked
				platformsData[slug].mastodon = newMastodon.length > 0 ? newMastodon : platformsData[slug].mastodon;
			} else {
				platformsData[slug] = { mastodon: newMastodon };
			}
		}
	}
};

syncMastodon().then(() => {
	// Todo after everything else
	fs.writeFileSync(
		path.join(".", PLATFORMS_FILE),
		JSON.stringify(platformsData, null, 2),
		{
			encoding: "utf8",
		},
	);
});
