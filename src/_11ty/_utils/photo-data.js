const matter = require('gray-matter');

let photoDataMemoization = {};

const getPhotoData = (data) => {
  const filePathStemParts = data.page.filePathStem.split('/');
  const photoSlug = filePathStemParts[filePathStemParts.length - 1];
  if (photoSlug in photoDataMemoization) {
    // This photo already exists in memoization
    return photoDataMemoization[photoSlug];
  } else {
    let photoDataCollection = matter.read(`src/photos/${photoSlug}/index.md`);
    // Keep a copy of this collection in memoization for later reuse
    photoDataMemoization[photoSlug] = photoDataCollection;

    return photoDataCollection;
  }
};

module.exports = getPhotoData;
