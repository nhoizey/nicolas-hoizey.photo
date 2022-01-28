const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

const ignoredSlugs = [
  'monochrome',
  'grignotage',
  'gouter-d-enfant',
  'gourmandise',
];

const allPhotosGlob = 'src/photos/*/index.md';
const usedPhotosGlob = 'src/galleries/**/*.md';
const galleriesGlob = 'src/galleries/**/index.md';

module.exports = {
  all_photos: (collection) =>
    collection.getFilteredByGlob(allPhotosGlob).sort((a, b) => b.date - a.date),
  photos_in_galleries: (collection) =>
    collection
      .getFilteredByGlob(usedPhotosGlob)
      .filter((item) => !item.filePathStem.endsWith('/index'))
      .sort((a, b) => b.date - a.date),
  photos_not_in_galleries: (collection) => {
    const used_photos = collection
      .getFilteredByGlob(usedPhotosGlob)
      .filter((item) => !item.filePathStem.endsWith('/index'))
      .map((item) => item.fileSlug);
    return collection
      .getFilteredByGlob(allPhotosGlob)
      .filter((item) => !ignoredSlugs.includes(item.fileSlug))
      .filter((item) => !used_photos.includes(item.fileSlug))
      .sort((a, b) => b.date - a.date);
  },
  unique_photos: (collection) => {
    const distinctPhotos = [];
    return collection
      .getFilteredByGlob(usedPhotosGlob)
      .filter((item) => !item.filePathStem.endsWith('/index'))
      .filter((item) => {
        if (distinctPhotos.includes(item.fileSlug)) {
          return false;
        } else {
          distinctPhotos.push(item.fileSlug);
          return true;
        }
      })
      .sort((a, b) => b.date - a.date);
  },
  photo_galleries: (collection) =>
    collection
      .getFilteredByGlob(galleriesGlob)
      .sort((a, b) => sortOrderThenAlpha(a, b)),
};
