// Load .env variables with dotenv
import { } from "dotenv/config";

import path from "node:path";
import slugify from "../src/_11ty/_utils/slugify.js";
import matter from "gray-matter";

import { createFlickr } from "flickr-sdk";
const { flickr } = createFlickr(process.env.FLICKR_CONSUMER_KEY);

const FEED_URL = 'https://nicolas-hoizey.photo/feeds/mastodon/photos.json';

const posseToFlickr = async () => {
	const flickrPhotos = await flickr("flickr.people.getPublicPhotos", {
		user_id: process.env.FLICKR_USER_ID,
		per_page: 500,
	}).then((body) => body.photos.photo);
	const flickrTitles = flickrPhotos.map(photo => photo.title);

	const photosToPosse = [];
	const feedContent = await fetch(FEED_URL).then((response) => response.json());
	feedContent.items.map((item) => {
		if (!flickrTitles.includes(item.title)) {
			photosToPosse.push(item);
		}
	});

	photosToPosse.sort((a, b) => {
		const dateA = new Date(a.date_published);
		const dateB = new Date(b.date_published);
		return dateA - dateB;
	}
	);

	const photoToPosse = photosToPosse[0];
	const photoToPosseSlug = slugify(photoToPosse.title);

	const { upload } = createFlickr({
		consumerKey: process.env.FLICKR_CONSUMER_KEY,
		consumerSecret: process.env.FLICKR_CONSUMER_SECRET,
		oauthToken: process.env.FLICKR_OAUTH_TOKEN,
		oauthTokenSecret: process.env.FLICKR_OAUTH_TOKEN_SECRET,
	});

	const photoId = await upload(path.resolve(`src/collections/photos/${photoToPosseSlug}/${photoToPosseSlug}.jpg`));

	console.log(
		`Uploaded photo "${photoToPosse.title}" to Flickr: https://www.flickr.com/photos/nicolas-hoizey/${photoId.id}/`
	);

	const photoToPosseMatter = matter.read(
		`src/collections/photos/${photoToPosseSlug}/index.md`,
	);
	const groups = [];
	for (const tag of photoToPosseMatter.data.tags) {
		switch (tag) {
			case 'République dominicaine':
				groups.push('76716807@N00', '79884596@N00', '2150860@N23', '52195003@N00');
				break;
		}
	}
	// TODO: also add groups based on categories the photo belongs to

};

posseToFlickr();
