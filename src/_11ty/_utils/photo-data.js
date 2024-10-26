import matter from 'gray-matter';
import glob from 'fast-glob';

import platformsData from '../../_data/platforms.json' with { type: 'json' };

const GALLERY_URL_REGEX =
	/^https:\/\/nicolas-hoizey.photo\/galleries\/([^/]+\/)*([^/]+)\/$/;

const allPhotos = glob
	.sync('src/collections/photos/*/index.md')
	.map((photo) =>
		photo.replace('src/collections/photos/', '').replace('/index.md', '')
	);

const webmentionsInterestingness = {};
import webmentionsCache from '../../../_cache/webmentions.json' with { type: 'json' };

webmentionsCache.webmentions
	.filter((mention) => {
		if (mention.url.startsWith('https://www.flickr.com/')) {
			// We already have Flickr data in platforms
			return false;
		}
	})
	.map((mention) => {
		// Rewrite photo URLs to use the canonical URL
		if ((galleryUrl = mention['wm-target'].match(GALLERY_URL_REGEX))) {
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

let photoDataMemoization = {};

const getPhotoData = (slug) => {
	if (slug in photoDataMemoization) {
		// This photo already exists in memoization
		return photoDataMemoization[slug];
	} else {
		let photoDataCollection = matter.read(
			`src/collections/photos/${slug}/index.md`
		);

		let interestingness = 0;

		// Add interestingness from platforms
		if (platformsData[slug] !== undefined) {
			const platforms = platformsData[slug];
			photoDataCollection.platforms = platforms;

			if (platforms.flickr) {
				interestingness += platforms.flickr.faves;
			}

			if (platforms.pixelfed) {
				interestingness += platforms.pixelfed.reduce(
					(accumulator, currentValue) => accumulator + currentValue.faves,
					0
				);
				interestingness +=
					5 *
					platforms.pixelfed.reduce(
						(accumulator, currentValue) => accumulator + currentValue.reblogs,
						0
					);
			}

			if (platforms.unsplash) {
				interestingness += platforms.unsplash.downloads / 500;
			}
		}

		// Add interestingness from webmention likes (not from Flickr)
		interestingness += webmentionsInterestingness[slug] || 0;

		photoDataCollection.interestingness = interestingness;

		// Keep a copy of this collection in memoization for later reuse
		photoDataMemoization[slug] = photoDataCollection;

		return photoDataCollection;
	}
};

export default getPhotoData;
