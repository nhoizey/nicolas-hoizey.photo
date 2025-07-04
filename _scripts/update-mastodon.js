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

	for (const url in posseData) {
		const slug = url.split("/").slice(-2, -1)[0];
		if (platformsData[slug] !== undefined) {
			platformsData[slug].mastodon = [];
		} else {
			platformsData[slug] = { mastodon: [] };
		}

		for (const postUrl of posseData[url].toots) {
			const postId = postUrl.split("/").pop();
			let mastodonPost;
			try {
				mastodonPost = await masto.v1.statuses.$select(`${postId}`).fetch();

				platformsData[slug].mastodon.push({
					id: `${postId}`,
					faves: mastodonPost.favouritesCount,
					reblogs: mastodonPost.reblogsCount,
				});
			} catch (error) {
				// TODO: if this is a 404, then the post has been deleted, remove it from the posseData
				console.dir(error);
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
