const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

const galleriesGlob = 'src/galleries/**/index.md';

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

module.exports = {
  photo_galleries: (collection) => getGalleries(collection),
};
