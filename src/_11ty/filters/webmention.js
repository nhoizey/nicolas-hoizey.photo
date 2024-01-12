const memoize = require('fast-memoize');

const glob = require('fast-glob').sync;
const { readFromCache } = require('../../_utils/cache');

const rootUrl = require('../../../package.json').homepage;
const ownSocialUrls = [
  'https://mamot.fr/@nhoizey',
  'https://twitter.com/nhoizey',
  'https://pixelfed.social/nhoizey',
];

const WEBMENTION_CACHE = '_cache/webmentions.json';
const WEBMENTION_BLOCKLIST = '../webmention-blocklist.json';

const GALLERY_URL_REGEX =
  /^https:\/\/nicolas-hoizey.photo\/galleries\/([^/]+\/)*([^/]+)\/$/;

const allPhotos = glob('src/photos/*/index.md').map((photo) =>
  photo.replace('src/photos/', '').replace('/index.md', '')
);

const getWebmentions = memoize(() => {
  const cached = readFromCache(WEBMENTION_CACHE);
  const webmentionBlocklist = require(WEBMENTION_BLOCKLIST);
  return cached.webmentions
    .filter((mention) => !webmentionBlocklist.includes(`${mention['wm-id']}`))
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

module.exports = {
  getWebmentionsForUrl: memoize((url) => {
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
  }),
  webmentionsByType: (mentions, mentionType) => {
    return mentions.filter((entry) => entry['wm-property'] === mentionType);
  },
  getMyWebmentionsForUrl: (webmentions, url) => {
    if (url === undefined) {
      console.log('No URL for webmention matching');
      return [];
    }
    return webmentions
      .filter((entry) => {
        return entry['wm-target'] === `${rootUrl}${url}`;
      })
      .filter((entry) => isSelf(entry));
  },
  getMyWebmentionsWithoutTarget: (webmentions) => {
    return webmentions.filter((entry) => {
      return entry['wm-target'] === undefined;
    });
  },
  isOwnWebmention: (webmention) => {
    const urls = [rootUrl, ownSocialUrl];
    const authorUrl = webmention.author ? webmention.author.url : false;
    // check if a given URL is part of this site.
    return authorUrl && urls.includes(authorUrl);
  },
};
