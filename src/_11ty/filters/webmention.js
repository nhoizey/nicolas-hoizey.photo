import memoize from 'fast-memoize';
import glob from 'fast-glob';
import { readFromCache } from '../../_utils/cache.js';
import WEBMENTION_BLOCKLIST from '../webmention-blocklist.json' with { type: 'json' };

import pkg from '../../../package.json' with { type: 'json' };
const rootUrl = pkg.homepage;

const ownSocialUrls = [
	'https://mamot.fr/@nhoizey',
	'https://twitter.com/nhoizey',
	'https://pixelfed.social/nhoizey',
];

const WEBMENTION_CACHE = '_cache/webmentions.json';

const GALLERY_URL_REGEX =
	/^https:\/\/nicolas-hoizey.photo\/galleries\/([^/]+\/)*([^/]+)\/$/;

const allPhotos = glob
	.sync('src/collections/photos/*/index.md')
	.map((photo) =>
		photo.replace('src/collections/photos/', '').replace('/index.md', '')
	);

const getWebmentions = memoize(() => {
	const cached = readFromCache(WEBMENTION_CACHE);
	let galleryUrl;
	return cached.webmentions
		.filter((mention) => {
			if (
				mention.url.startsWith('https://www.flickr.com/') &&
				mention['wm-property'] === 'in-reply-to'
			) {
				// Comments on Flickr are crappy, so we only keep likes
				return false;
			}
			return !WEBMENTION_BLOCKLIST.includes(`${mention['wm-id']}`);
		})
		.map((mention) => {
			// Rewrite photo URLs to use the “short” canonical URL
			if ((galleryUrl = mention['wm-target'].match(GALLERY_URL_REGEX))) {
				if (allPhotos.includes(galleryUrl[2])) {
					mention['wm-target'] = `${rootUrl}/photos/${galleryUrl[2]}/`;
				}
			}
			return mention;
		});
});

function isSelf(entry) {
	return (
		entry['wm-property'] === 'repost-of' &&
		ownSocialUrls.reduce(
			(accumulator, currentValue) =>
				accumulator || entry.url.startsWith(currentValue),
			false
		)
	);
}

export const getWebmentionsForUrl = memoize((url) => {
	// TODO: for each URL, we loop through all webmentions, should be optimized
	if (url === undefined) {
		console.log('No URL for webmention matching');
		return [];
	}
	if (url === false) {
		// TODO: useful? Should happen only for drafts in production mode
		return [];
	}

	return getWebmentions()
		.filter((entry) => !isSelf(entry))
		.filter((entry) => {
			return new URL(entry['wm-target']).pathname === url;
		});
});

export const webmentionsByType = (mentions, mentionType) => {
	return mentions.filter((entry) => entry['wm-property'] === mentionType);
};

export const getMyWebmentionsForUrl = (webmentions, url) => {
	if (url === undefined) {
		console.log('No URL for webmention matching');
		return [];
	}
	return webmentions
		.filter((entry) => {
			return entry['wm-target'] === `${rootUrl}${url}`;
		})
		.filter((entry) => isSelf(entry));
};

export const getMyWebmentionsWithoutTarget = (webmentions) => {
	return webmentions.filter((entry) => {
		return entry['wm-target'] === undefined;
	});
};

export const isOwnWebmention = (webmention) => {
	const urls = [rootUrl, ownSocialUrl];
	const authorUrl = webmention.author ? webmention.author.url : false;
	// check if a given URL is part of this site.
	return authorUrl && urls.includes(authorUrl);
};
