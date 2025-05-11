#!/usr/bin/env node

// Load .env variables with dotenv
import {} from "dotenv/config";

import path from "node:path";
import { argv, exit } from 'node:process';

import glob from "fast-glob";
import { createFlickr } from "flickr-sdk";
import matter from "gray-matter";

import slugify from "../src/_11ty/_utils/slugify.js";

if (argv.length < 3 || !["posse", "test"].includes(argv[2])) {
	console.error("Usage: ./_scripts/posse-to-flickr.js <mode>");
	console.error("  mode: 'posse' or 'test'");
	exit(1);
}

const MODE = argv[2];

const { flickr } = createFlickr({
	consumerKey: process.env.FLICKR_CONSUMER_KEY,
	consumerSecret: process.env.FLICKR_CONSUMER_SECRET,
	oauthToken: process.env.FLICKR_OAUTH_TOKEN,
	oauthTokenSecret: process.env.FLICKR_OAUTH_TOKEN_SECRET,
});

const FEED_URL = "https://nicolas-hoizey.photo/feeds/mastodon/photos.json";

let photoId;

const posseToFlickr = async () => {
	const flickrPhotos = await flickr("flickr.people.getPublicPhotos", {
		user_id: process.env.FLICKR_USER_ID,
		per_page: 500,
	}).then((body) => body.photos.photo);
	const flickrSlugs = flickrPhotos.map((photo) => slugify(photo.title));

	const photosToPosse = [];
	const feedContent = await fetch(FEED_URL).then((response) => response.json());
	feedContent.items.map((item) => {
		if (!flickrSlugs.includes(slugify(item.title))) {
			photosToPosse.push(item);
		}
	});

	photosToPosse.sort((a, b) => {
		const dateA = new Date(a.date_published);
		const dateB = new Date(b.date_published);
		return dateA - dateB;
	});

	if (photosToPosse.length === 0) {
		console.log("No new photos to posse.");
		exit(0);
	} else {
		console.log(`${photosToPosse.length} new photo${photosToPosse.length > 1 ? 's' : ''} still to POSSE.`);
	}

	const photoToPosse = photosToPosse[0];
	const photoToPosseSlug = slugify(photoToPosse.title);

	console.log('');
	console.log(`Next photo to POSSE:
${photoToPosse.title}`);

	if (MODE === "test") {
		console.dir(photoToPosse);
	}

	if (MODE === "posse") {
		const { upload } = createFlickr({
			consumerKey: process.env.FLICKR_CONSUMER_KEY,
			consumerSecret: process.env.FLICKR_CONSUMER_SECRET,
			oauthToken: process.env.FLICKR_OAUTH_TOKEN,
			oauthTokenSecret: process.env.FLICKR_OAUTH_TOKEN_SECRET,
		});

		const photoData = await upload(
			path.resolve(
				`src/collections/photos/${photoToPosseSlug}/${photoToPosseSlug}.jpg`,
			),
		);
		photoId = photoData.id;

		console.log(
			`Uploaded to Flickr:
https://www.flickr.com/photos/nicolas-hoizey/${photoId}/`,
		);
	}

	const photoToPosseMatter = matter.read(
		`src/collections/photos/${photoToPosseSlug}/index.md`,
	);

	const tagsForGroups = new Set(
		photoToPosseMatter.data.tags.map((tag) => slugify(tag)),
	);
	tagsForGroups.add(slugify(photoToPosseMatter.data.gear.camera.brand));
	tagsForGroups.add(slugify(photoToPosseMatter.data.gear.camera.model));
	if (photoToPosseMatter.data.gear.lenses?.length > 0) {
		tagsForGroups.add(slugify(photoToPosseMatter.data.gear.lenses[0].model));
	}

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

	if (MODE === "test") {
		console.log('');
		console.log('Tags for groups:');
		console.dir(tagsForGroups);
	}

	const groups = new Set();

	// Default groups that work for all photos
	groups.add("3109374@N20").add("14625602@N25").add("14805334@N23");

	/* **************************************************************
	 * Location groups
	 * **************************************************************/

	if (tagsForGroups.has("travels")) {
		groups
			.add("63277308@N00")
			.add("460979@N25")
			.add("402895@N25")
			.add("11488522@N00")
			.add("48926546@N00")
			.add("88527108@N00")
			.add("14730570@N21")
			.add("41425956@N00")
			.add("74794523@N00")
			.add("651467@N20")
			.add("2904475@N20")
			.add("11427634@N00")
			.add("1412034@N24");
	}

	if (tagsForGroups.has("europe")) {
		groups.add('66465160@N00');
	}

	if (tagsForGroups.has("the-netherlands")) {
		groups.add("2159224@N22").add('49503146580@N01').add('14788136@N23').add('1901097@N21').add('29814064@N00').add('985968@N21');
	}

	if (tagsForGroups.has("gelderland")) {
		groups.add('361037@N22')
	}

	if (tagsForGroups.has("arnhem")) {
		groups.add('35473874@N00')
	}

	if (tagsForGroups.has("caribbean")) {
		groups.add("2150860@N23").add("52195003@N00");
	}

	if (tagsForGroups.has("dominican-republic")) {
		groups.add("76716807@N00").add("79884596@N00");
	}

	/* **************************************************************
	 * Features groups
	 * **************************************************************/

	if (tagsForGroups.has("beach")) {
		groups
			.add("1172962@N22")
			.add("808899@N25")
			.add("677271@N20")
			.add("724095@N25")
			.add("81682017@N00")
			.add("664924@N23")
			.add("20766682@N00")
			.add("1224189@N23")
			.add("1090052@N22")
			.add("21939921@N00")
			.add("1179414@N22")
			.add("931380@N21")
			.add("92767609@N00");
	}

	if (tagsForGroups.has("mill")) {
		groups.add('454805@N23').add('1703430@N25').add('43383821@N00');
	}

	if (tagsForGroups.has("mill") && tagsForGroups.has("the-netherlands")) {
		groups.add("41194381@N00");
	}

	/* **************************************************************
 * Animal groups
 * **************************************************************/

	if (tagsForGroups.has("animal")) {
		groups
			.add("61595479@N00")
			.add("387770@N21")
			.add("47643757@N00")
			.add("632084@N23")
			.add("32733435@N00")
			.add("35025468@N00")
			.add("93779905@N00")
			.add("19126019@N00")
			.add("3601763@N25")
			.add("646385@N24")
			.add("860455@N21")
			.add("647756@N24")
			.add("2719884@N21")
			.add("1286217@N25")
			.add("14702046@N25")
			.add("2122493@N22")
			.add("2719884@N21")
			.add("40025645@N00")
			.add("782584@N21");
	}

	if (tagsForGroups.has("bird") && tagsForGroups.has("africa")) {
		groups.add("74983586@N00");
	}

	if (tagsForGroups.has("bird") && tagsForGroups.has("france")) {
		groups.add("941858@N24");
	}

	if (tagsForGroups.has("bird") && tagsForGroups.has("sweden")) {
		groups.add("952155@N20");
	}

	if (tagsForGroups.has("bird") && tagsForGroups.has("europe")) {
		groups.add("842458@N22");
	}

	if (tagsForGroups.has("bird") && tagsForGroups.has("wildlife")) {
		groups
			.add("709187@N23")
			.add("1568944@N22")
			.add("1408810@N24")
			.add("14775412@N21");
	}

	if (tagsForGroups.has("bird")) {
		groups
			.add("670107@N23")
			.add("1759665@N23")
			.add("761059@N20")
			.add("1127142@N24")
			.add("1392659@N24")
			.add("51569276@N00")
			.add("490652@N24")
			.add("2356068@N22")
			.add("1564986@N20")
			.add("709020@N22")
			.add("2544388@N20")
			.add("58234477@N00")
			.add("52379160@N00")
			.add("1264492@N21")
			.add("62499500@N00")
			.add("14477233@N00")
			.add("1259323@N25")
			.add("1594327@N22")
			.add("2870367@N22")
			.add("44319075@N00")
			.add("2897744@N23")
			.add("14825259@N22")
			.add("82953312@N00")
			.add("878749@N23")
			.add("318169@N20")
			.add("626519@N25")
			.add("1613349@N24")
			.add("810607@N24")
			.add("4044781@N25")
			.add("3006485@N23")
			.add("4506897@N23")
			.add("69512949@N00")
			.add("2788285@N24")
			.add("2913475@N23");
	}

	if (tagsForGroups.has("kingfisher")) {
		groups
			.add("712689@N23")
			.add("1052227@N24")
			.add("1017889@N22")
			.add("433144@N22")
			.add("40029665@N00");
	}

	if (tagsForGroups.has("marine-mammals")) {
		groups.add("34724210@N00");
	}

	if (tagsForGroups.has("cetacea")) {
		groups.add("87972607@N00").add("74159600@N00");
	}

	if (tagsForGroups.has("whale")) {
		groups.add("722693@N25").add("23226934@N00").add("1721972@N20");
	}

	if (tagsForGroups.has("wildlife") && tagsForGroups.has("africa")) {
		groups.add("99071611@N00").add("2473768@N21");
	}

	if (tagsForGroups.has("wildlife")) {
		groups
			.add("79625603@N00")
			.add("49502993915@N01")
			.add("1780111@N23")
			.add("1744900@N21")
			.add("517805@N22")
			.add("915922@N23")
			.add("2812345@N21")
			.add("2332929@N20")
			.add("2740203@N20")
			.add("1831637@N21")
			.add("755229@N23")
			.add("24376064@N00")
			.add("897629@N21")
			.add("613546@N23")
			.add("49032118@N00")
			.add("1651475@N20")
			.add("579191@N22")
			.add("93538174@N00")
			.add("1390236@N25")
			.add("797825@N22")
			.add("576928@N23")
			.add("24303550@N00")
			.add("1841383@N22")
			.add("1586745@N24")
			.add("1521228@N25")
			.add("399695@N21")
			.add("91806330@N00")
			.add("1223872@N22")
			.add("43568224@N00");
	}

	/* **************************************************************
	 * Gear groups
	 * **************************************************************/

	if (tagsForGroups.has("fujifilm")) {
		groups
			.add("1942023@N20")
			.add("1927840@N20")
			.add("4001926@N22")
			.add("1763261@N25")
			.add("14665600@N23")
			.add("2756287@N25")
			.add("1874432@N24")
			.add("1426195@N22")
			.add("728696@N23")
			.add("1407416@N22")
			.add("843996@N23")
			.add("1179025@N25")
			.add("2765150@N21")
			.add("2746396@N25")
			.add("2741340@N22")
			.add("2140999@N24")
			.add("1878068@N23")
			.add("93484108@N00");
	}

	if (tagsForGroups.has("x-t2")) {
		groups
			.add("2970680@N25")
			.add("2841709@N25")
			.add("2983137@N20")
			.add("3057090@N21")
			.add("4001926@N22")
			.add("2925177@N21");
	}

	if (tagsForGroups.has("x-t3")) {
		groups.add("4001926@N22");
	}

	if (tagsForGroups.has("fujinon-xf-10-24mm-f-4-0-r-ois")) {
		groups
			.add("2077382@N20")
			.add("2621709@N24")
			.add("2010873@N23")
			.add("2654405@N20");
	}

	if (MODE === "test") {
		console.log('');
		console.log(`${groups.size} groups to add the photo to:`);
		console.dir(groups);
	}

	if (MODE === "posse") {
		console.info(`
	Trying to add the photo to ${groups.size} groups…
`);
		for (const groupId of groups) {
			await flickr("flickr.groups.pools.add", {
				group_id: groupId,
				photo_id: photoId,
			}).catch((error) => {
				switch (error.cause.code) {
					case 5:
						console.info(
							`🍯 Limit riched for group https://flickr.com/groups/${groupId}/`,
						);
						break;
					case 6:
						console.info(
							`⏳ In pending queue for group https://flickr.com/groups/${groupId}/`,
						);
						break;
					default:
						console.error(`Error adding photo to group https://flickr.com/groups/${groupId}/`);
						console.dir(error);
				}
			});
		}
	}
};

posseToFlickr();
