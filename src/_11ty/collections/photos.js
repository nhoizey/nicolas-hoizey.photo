// Add a "photos" collection with all photos

const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

module.exports = {
  photos: (collection) =>
    collection
      .getFilteredByGlob('src/photos/*/index.md')
      .sort((a, b) => b.date - a.date),
  galleries: (collection) =>
    collection
      .getAll()
      .filter((item) => item.url.match(/^\/(travels|wanderings|portraits)\//))
      .sort((a, b) => sortOrderThenAlpha(a, b)),
};
