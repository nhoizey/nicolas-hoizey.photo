const matter = require('gray-matter');
const platformsData = require('../../_data/platforms.json');

let photoDataMemoization = {};

const getPhotoData = (slug) => {
  if (slug in photoDataMemoization) {
    // This photo already exists in memoization
    return photoDataMemoization[slug];
  } else {
    let photoDataCollection = matter.read(`src/photos/${slug}/index.md`);

    let interestingness = 0;
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
    photoDataCollection.interestingness = interestingness;

    // Keep a copy of this collection in memoization for later reuse
    photoDataMemoization[slug] = photoDataCollection;

    return photoDataCollection;
  }
};

module.exports = getPhotoData;
