const glob = require('fast-glob').sync;

const ignoredSlugs = [
  'monochrome',
  'grignotage',
  'gouter-d-enfant',
  'gourmandise',
];

let platformsData = require('../../../src/_data/platforms.json');

const allPhotosGlob = 'src/photos/*/index.md';
const usedPhotosGlob = glob('src/galleries/**/*.md', {
  ignore: 'src/galleries/**/index.md',
});

let allPhotos = undefined;
const getAllPhotos = (collection) => {
  if (allPhotos !== undefined) {
    return allPhotos;
  }
  allPhotos = collection
    .getFilteredByGlob(allPhotosGlob)
    .sort((a, b) => b.date - a.date);
  return allPhotos;
};

let photosInGalleries = undefined;
const getPhotosInGalleries = (collection) => {
  if (photosInGalleries !== undefined) {
    return photosInGalleries;
  }
  photosInGalleries = collection
    .getFilteredByGlob(usedPhotosGlob)
    .sort((a, b) => b.date - a.date);
  return photosInGalleries;
};

let photosInGalleriesSlugs = undefined;
const getPhotosInGalleriesSlugs = (collection) => {
  if (photosInGalleriesSlugs !== undefined) {
    return photosInGalleriesSlugs;
  }
  photosInGalleriesSlugs = getPhotosInGalleries(collection).map(
    (item) => item.page.fileSlug
  );
  return photosInGalleriesSlugs;
};

module.exports = {
  all_photos: (collection) => getAllPhotos(collection),
  photos_in_galleries: (collection) => getPhotosInGalleries(collection),
  photos_not_in_galleries: (collection) => {
    const photosToIgnore = [
      ...ignoredSlugs,
      ...getPhotosInGalleriesSlugs(collection),
    ];
    return getAllPhotos(collection).filter(
      (item) => !photosToIgnore.includes(item.page.fileSlug)
    );
  },
  unique_photos: (collection) => {
    const distinctPhotosSlugs = [];
    globalUniquePhotos = getPhotosInGalleries(collection).filter((item) => {
      if (distinctPhotosSlugs.includes(item.page.fileSlug)) {
        return false;
      } else {
        distinctPhotosSlugs.push(item.page.fileSlug);
        return true;
      }
    });
    return globalUniquePhotos;
  },
  // popular_photos: (collection) => {
  //   const distinctPhotosSlugs = [];
  //   popularPhotos = getPhotosInGalleries(collection)
  //     .filter((item) => {
  //       if (distinctPhotosSlugs.includes(item.page.fileSlug)) {
  //         return false;
  //       } else {
  //         distinctPhotosSlugs.push(item.page.fileSlug);
  //         return true;
  //       }
  //     })
  //     .map((photo) => {
  //       photo.platforms = platformsData[photo.fileSlug] || {};
  //       return photo;
  //     })
  //     .sort(
  //       (a, b) =>
  //         (b.platforms.flickr?.favs || 0) +
  //         (b.platforms.unsplash?.likes || 0) -
  //         ((a.platforms.flickr?.favs || 0) + (a.platforms.unsplash?.likes || 0))
  //     );
  //   return popularPhotos;
  // },
};
