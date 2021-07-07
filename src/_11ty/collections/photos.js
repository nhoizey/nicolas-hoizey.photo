// Add a "photos" collection with all photos

const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

module.exports = {
  photos: (collection) =>
    collection
      .getAll()
      .filter((item) => item.url.match(/^\/photos\/[^/]+\//))
      .sort((a, b) => b.date - a.date),
  galleries: (collection) =>
    collection
      .getAll()
      .filter((item) => item.url.match(/^\/(travels|wanderings|portraits)\//))
      .sort((a, b) => sortOrderThenAlpha(a, b)),
};
