import glob from "fast-glob";
import matter from "gray-matter";

import platformsData from "../../_data/platforms.json" with { type: "json" };

const GALLERY_URL_REGEX =
	/^https:\/\/nicolas-hoizey.photo\/galleries\/([^/]+\/)*([^/]+)\/$/;

const allPhotos = glob
	.sync("src/collections/photos/*/index.md")
	.map((photo) =>
		photo.replace("src/collections/photos/", "").replace("/index.md", ""),
	);

const webmentionsInterestingness = {};

import webmentionsCache from "../../../_cache/webmentions.json" with {
	type: "json",
};

webmentionsCache.webmentions
	.filter((mention) => {
		if (mention.url.startsWith("https://www.flickr.com/")) {
			// We already have Flickr data in platforms
			return false;
		}
	})
	.map((mention) => {
		// Rewrite photo URLs to use the canonical URL
		const galleryUrl = mention["wm-target"].match(GALLERY_URL_REGEX);
		if (galleryUrl) {
			const photo = galleryUrl[2];
			if (allPhotos.includes(photo)) {
				if (webmentionsInterestingness[photo] === undefined) {
					webmentionsInterestingness[photo] = 0;
				}
				webmentionsInterestingness[photo]++;
			}
		}
		return mention;
	});

const photoDataMemoization = {};

const getPhotoData = (slug) => {
	if (slug in photoDataMemoization) {
		// This photo already exists in memoization
		return photoDataMemoization[slug];
	}
	const photoDataCollection = matter.read(
		`src/collections/photos/${slug}/index.md`,
	);

	let interestingness = 0;

	// Add interestingness from platforms
	if (platformsData[slug] !== undefined) {
		const platforms = platformsData[slug];
		photoDataCollection.platforms = platforms;

		let flickrFaves = 0;
		if (platforms.flickr) {
			flickrFaves = platforms.flickr.faves;
		}

		let pixelfedFaves = 0;
		let pixelfedReblogs = 0;
		if (platforms.pixelfed) {
			pixelfedFaves = platforms.pixelfed.reduce(
				(accumulator, currentValue) => accumulator + currentValue.faves,
				0,
			);
			pixelfedReblogs = platforms.pixelfed.reduce(
					(accumulator, currentValue) => accumulator + currentValue.reblogs,
					0,
				);
		}

		let mastodonFaves = 0;
		let mastodonReblogs = 0;
		if (platforms.mastodon) {
			mastodonFaves = platforms.mastodon.reduce(
				(accumulator, currentValue) => accumulator + currentValue.faves,
				0,
			);
			mastodonReblogs =
				platforms.mastodon.reduce(
					(accumulator, currentValue) => accumulator + currentValue.reblogs,
					0,
				);
		}

		let unsplashDownloads = 0;
		if (platforms.unsplash) {
			unsplashDownloads = platforms.unsplash.downloads;
		}

		// Super SECRET formula to compute interestingness
		interestingness += flickrFaves + pixelfedFaves + 5 * pixelfedReblogs + mastodonFaves + 5 * mastodonReblogs + unsplashDownloads / 500;
	}

	// Add interestingness from webmention likes (not from Flickr)
	interestingness += webmentionsInterestingness[slug] || 0;

	photoDataCollection.interestingness = interestingness;

	// Keep a copy of this collection in memoization for later reuse
	photoDataMemoization[slug] = photoDataCollection;

	return photoDataCollection;
};

export default getPhotoData;
