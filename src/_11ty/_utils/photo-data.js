const matter = require('gray-matter');

let photoDataMemoization = {};

const getPhotoData = (slug) => {
  if (slug in photoDataMemoization) {
    // This photo already exists in memoization
    return photoDataMemoization[slug];
  } else {
    let photoDataCollection = matter.read(`src/photos/${slug}/index.md`);
    // Keep a copy of this collection in memoization for later reuse
    photoDataMemoization[slug] = photoDataCollection;

    return photoDataCollection;
  }
};

module.exports = getPhotoData;
