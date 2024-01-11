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
      photoDataCollection.platforms = platformsData[slug];

      if (
        platformsData[slug].flickr !== undefined &&
        platformsData[slug].flickr.favs !== undefined
      ) {
        interestingness += platformsData[slug].flickr.favs;
      }
      if (
        platformsData[slug].pixelfed !== undefined &&
        platformsData[slug].pixelfed.favs !== undefined
      ) {
        interestingness += platformsData[slug].pixelfed.favs;
      }
      if (
        platformsData[slug].unsplash !== undefined &&
        platformsData[slug].unsplash.downloads !== undefined
      ) {
        interestingness += platformsData[slug].unsplash.downloads / 100;
      }
    }

    photoDataCollection.interestingness = interestingness;

    // Keep a copy of this collection in memoization for later reuse
    photoDataMemoization[slug] = photoDataCollection;

    return photoDataCollection;
  }
};

module.exports = getPhotoData;
