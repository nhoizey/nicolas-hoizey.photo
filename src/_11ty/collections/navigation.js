// Add a "navigation" collection with all auto collection homepages

const sortOrderThenAlpha = require('../_utils/sort-order-then-alpha');

module.exports = {
  navigation: (collection) =>
    collection
      .getFilteredByGlob('src/*/index.md')
      .filter((item) => 'nav' in item.data && 'order' in item.data.nav)
      .sort((a, b) => sortOrderThenAlpha(a, b)),
  navigation2: (collection) =>
    collection
      .getFilteredByGlob('src/*/*/index.md')
      .filter((item) => 'nav' in item.data && 'order' in item.data.nav)
      .sort((a, b) => sortOrderThenAlpha(a, b)),
};
