// Load .env variables with dotenv
import { } from "dotenv/config";

import path from "node:path";
import matter from "gray-matter";
import glob from "fast-glob";
import { createFlickr } from "flickr-sdk";

import slugify from "../src/_11ty/_utils/slugify.js";

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

	const tagsForGroups = new Set(photoToPosseMatter.data.tags);
	tagsForGroups.add(photoToPosseMatter.data.gear.camera.brand);
	tagsForGroups.add(photoToPosseMatter.data.gear.camera.model);
	tagsForGroups.add(photoToPosseMatter.data.gear.lenses[0].model);

	// Get the list of galleries with this photo
	const galleries = await glob([`**/${photoToPosseSlug}.md`], {
		cwd: "src/pages/galleries/",
		onlyDirectories: false,
	});

	for (const gallery of galleries) {
		for (const gallerySlug of gallery.split("/").slice(0, -1)) {
			tagsForGroups.add(gallerySlug);
		}
	}

	const groups = new Set();
	for (const tag of tagsForGroups) {
		console.log(slugify(tag));
		switch (slugify(tag)) {
			case 'travels':
				groups.add('63277308@N00').add('460979@N25').add('402895@N25').add('11488522@N00').add('48926546@N00').add('88527108@N00').add('14730570@N21').add('41425956@N00').add('74794523@N00').add('651467@N20').add('2904475@N20').add('11427634@N00').add('1412034@N24');
				break;
			case 'beach':
				groups.add('1172962@N22').add('808899@N25').add('677271@N20').add('724095@N25').add('81682017@N00').add('664924@N23').add('20766682@N00').add('1224189@N23').add('1090052@N22').add('21939921@N00').add('1179414@N22').add('931380@N21').add('92767609@N00');
				break;
			case 'caribbean':
				groups.add('2150860@N23').add('52195003@N00');
				break;
			case 'dominican-republic':
				groups.add('76716807@N00').add('79884596@N00');
				break;
			case 'animal':
				groups.add('61595479@N00').add('387770@N21').add('47643757@N00').add('632084@N23').add('32733435@N00').add('35025468@N00').add('93779905@N00').add('19126019@N00').add('3601763@N25').add('646385@N24').add('860455@N21').add('647756@N24').add('2719884@N21').add('1286217@N25').add('14702046@N25').add('2122493@N22');
				break;
			case 'marine-mammals':
				groups.add('34724210@N00');
				break;
			case 'catacea':
				groups.add('87972607@N00').add('74159600@N00');
				break;
			case 'whale':
				groups.add('722693@N25').add('23226934@N00').add('1721972@N20');
				break;
			case 'wildlife':
				groups.add('79625603@N00').add('49502993915@N01').add('1780111@N23').add('1744900@N21').add('517805@N22').add('915922@N23').add('2812345@N21').add('2332929@N20').add('2740203@N20').add('1831637@N21').add('2624147@N23').add('755229@N23').add('24376064@N00').add('897629@N21').add('613546@N23').add('49032118@N00').add('1651475@N20').add('579191@N22').add('93538174@N00');
				break;
			case 'fujifilm':
				groups.add('1942023@N20').add('1927840@N20').add('4001926@N22').add('1763261@N25').add('14665600@N23').add('2756287@N25').add('1874432@N24').add('1426195@N22').add('728696@N23').add('1407416@N22').add('843996@N23').add('1179025@N25').add('2765150@N21').add('2746396@N25').add('2741340@N22').add('2140999@N24').add('1878068@N23').add('93484108@N00');
				break;
			case 'x-t2':
				groups.add('2970680@N25').add('2841709@N25').add('2983137@N20').add('3057090@N21').add('4001926@N22').add('2925177@N21');
				break;
			case 'x-t3':
				groups.add('4001926@N22');
				break;
			case 'fujinon-xf-10-24mm-f-4-0-r-ois':
				groups.add('2077382@N20').add('2621709@N24').add('2010873@N23').add('2654405@N20');
				break;
			default:
				groups.add('3109374@N20').add('14625602@N25').add('14805334@N23');
				break;
		}
	}

	console.info(`
Trying to add the photo to ${groups.size} groups…`);
	for (const groupId of groups) {
		await flickr("flickr.groups.pools.add", {
			group_id: groupId,
			photo_id: photoId,
		}).catch((error) => {
			console.error(
				`Error adding photo to group https://flickr.com/groups/${groupId}/: ${error.message}`,
			);
		});
	}

};

posseToFlickr();
