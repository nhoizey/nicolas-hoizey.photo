const glob = require('fast-glob').sync;

const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

const ignoredSlugs = [
  'monochrome',
  'grignotage',
  'gouter-d-enfant',
  'gourmandise',
];

const galleriesGlob = 'src/galleries/**/index.md';
const allPhotosGlob = 'src/photos/*/index.md';
const usedPhotosGlob = glob('src/galleries/**/*.md', {
  ignore: 'src/galleries/**/index.md',
});

let galleries = undefined;
const getGalleries = (collection) => {
  if (galleries !== undefined) {
    return galleries;
  }
  galleries = collection
    .getFilteredByGlob(galleriesGlob)
    .sort((a, b) => sortOrderThenAlpha(a, b));
  return galleries;
};

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
  photo_galleries: (collection) => getGalleries(collection),
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
};
