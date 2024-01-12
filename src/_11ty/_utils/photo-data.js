const matter = require('gray-matter');
const glob = require('fast-glob').sync;

const platformsData = require('../../_data/platforms.json');

const GALLERY_URL_REGEX =
  /^https:\/\/nicolas-hoizey.photo\/galleries\/([^/]+\/)*([^/]+)\/$/;

const allPhotos = glob('src/photos/*/index.md').map((photo) =>
  photo.replace('src/photos/', '').replace('/index.md', '')
);

const webmentionsInterestingness = {};
require('../../../_cache/webmentions.json').webmentions.map((mention) => {
  // Rewrite photo URLs to use the canonical URL
  if ((galleryUrl = mention['wm-target'].match(GALLERY_URL_REGEX))) {
    if (allPhotos.includes(galleryUrl[2])) {
      const photo = galleryUrl[2];
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
    let photoDataCollection = matter.read(`src/photos/${slug}/index.md`);

    let interestingness = 0;

    // Add interestingness from platforms
    if (platformsData[slug] !== undefined) {
      const platforms = platformsData[slug];
      photoDataCollection.platforms = platforms;

      if (
        platforms.flickr !== undefined &&
        platforms.flickr.favs !== undefined
      ) {
        interestingness += platforms.flickr.favs;
      }
      if (
        platforms.pixelfed !== undefined &&
        platforms.pixelfed.favs !== undefined
      ) {
        interestingness += platforms.pixelfed.favs;
      }
      if (
        platforms.unsplash !== undefined &&
        platforms.unsplash.downloads !== undefined
      ) {
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

module.exports = getPhotoData;
