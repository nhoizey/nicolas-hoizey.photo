const getPhotoData = require('../_utils/photo-data');

const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

module.exports = {
  photos_in_galleries: (collection) =>
    collection
      .getFilteredByGlob([
        'src/travels/**/*.md',
        'src/wanderings/**/*.md',
        'src/portraits/**/*.md',
      ])
      .filter((item) => !item.filePathStem.endsWith('/index'))
      .sort((a, b) => b.data.date - a.data.date),
  all_photos: (collection) =>
    collection
      .getFilteredByGlob('src/photos/*/index.md')
      .sort((a, b) => b.date - a.date),
  galleries: (collection) =>
    collection
      .getFilteredByGlob([
        'src/travels/**/*.md',
        'src/wanderings/**/*.md',
        'src/portraits/**/*.md',
      ])
      .filter((item) => item.filePathStem.endsWith('/index'))
      .sort((a, b) => sortOrderThenAlpha(a, b)),
};
