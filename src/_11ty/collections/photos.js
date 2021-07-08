const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

module.exports = {
  all_photos: (collection) =>
    collection
      .getFilteredByGlob('src/photos/*/index.md')
      .sort((a, b) => b.date - a.date),
  photos_in_galleries: (collection) =>
    collection
      .getFilteredByGlob([
        'src/travels/**/*.md',
        'src/wanderings/**/*.md',
        'src/portraits/**/*.md',
      ])
      .filter((item) => !item.filePathStem.endsWith('/index'))
      .sort((a, b) => b.data.date - a.data.date),
  photos_not_in_galleries: (collection) => {
    const used_photos = collection
      .getFilteredByGlob([
        'src/travels/**/*.md',
        'src/wanderings/**/*.md',
        'src/portraits/**/*.md',
      ])
      .filter((item) => !item.filePathStem.endsWith('/index'))
      .map((item) => item.fileSlug);
    return collection
      .getFilteredByGlob('src/photos/*/index.md')
      .filter((item) => !used_photos.includes(item.fileSlug))
      .sort((a, b) => b.data.date - a.data.date);
  },
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
