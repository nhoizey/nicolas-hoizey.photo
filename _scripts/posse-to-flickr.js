// Load .env variables with dotenv
import { } from "dotenv/config";

import path from "node:path";
import slugify from "../src/_11ty/_utils/slugify.js";
import matter from "gray-matter";

import { createFlickr } from "flickr-sdk";
const { flickr } = createFlickr({
	consumerKey: process.env.FLICKR_CONSUMER_KEY,
	consumerSecret: process.env.FLICKR_CONSUMER_SECRET,
	oauthToken: process.env.FLICKR_OAUTH_TOKEN,
	oauthTokenSecret: process.env.FLICKR_OAUTH_TOKEN_SECRET,
});

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

	const photoData = await upload(path.resolve(`src/collections/photos/${photoToPosseSlug}/${photoToPosseSlug}.jpg`));
	const photoId = photoData.id;

	console.log(
		`Uploaded photo "${photoToPosse.title}" to Flickr: https://www.flickr.com/photos/nicolas-hoizey/${photoId}/`
	);

	const photoToPosseMatter = matter.read(
		`src/collections/photos/${photoToPosseSlug}/index.md`,
	);
	// console.dir(photoToPosseMatter, { depth: null });

	const tagsForGroups = photoToPosseMatter.data.tags;
	tagsForGroups.push(photoToPosseMatter.data.gear.camera.brand);
	tagsForGroups.push(photoToPosseMatter.data.gear.camera.model);
	tagsForGroups.push(photoToPosseMatter.data.gear.lenses[0].model);
	// TODO: also add groups based on categories the photo belongs to

	const groups = [];
	for (const tag of tagsForGroups) {
		switch (tag) {
			case 'Travel':
				groups.push('63277308@N00', '460979@N25', '402895@N25', '11488522@N00', '48926546@N00', '88527108@N00', '14730570@N21', '41425956@N00', '74794523@N00', '651467@N20', '2904475@N20', '11427634@N00', '1412034@N24');
				break;
			case 'République dominicaine':
				groups.push('76716807@N00', '79884596@N00', '2150860@N23', '52195003@N00');
				break;
			case 'Fujifilm':
				groups.push('1942023@N20', '1927840@N20', '4001926@N22', '1763261@N25', '14665600@N23', '2756287@N25', '1874432@N24', '1426195@N22', '728696@N23', '1407416@N22', '843996@N23', '1179025@N25', '2765150@N21', '2746396@N25', '2741340@N22', '2140999@N24', '1878068@N23', '93484108@N00');
				break;
			case 'X-T2':
				groups.push('2970680@N25', '2841709@N25', '2983137@N20', '3057090@N21', '4001926@N22', '2925177@N21');
				break;
			case 'X-T3':
				groups.push('4001926@N22');
				break;
			case 'Fujinon XF 10-24mm f/4.0 R OIS':
				groups.push('2077382@N20', '2621709@N24', '2010873@N23', '2654405@N20');
				break;
		}
	}

	for (const groupId of groups) {
		await flickr("flickr.groups.pools.add", {
			group_id: groupId,
			photo_id: photoId,
		}).catch((error) => {
			console.error(
				`Error adding photo to group ${groupId}: ${error.message}`,
			);
		});
	}

};

posseToFlickr();
