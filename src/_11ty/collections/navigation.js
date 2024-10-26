// Add a "navigation" collection with all auto collection homepages

import sortOrderThenAlpha from '../_utils/sort-order-then-alpha.js';

export const navigation = (collection) =>
	collection
		.getFilteredByGlob('src/{collections,pages}/*/index.*')
		.filter((item) => 'nav' in item.data && 'order' in item.data.nav)
		.sort((a, b) => sortOrderThenAlpha(a, b));

export const navigation2 = (collection) =>
	collection
		.getFilteredByGlob(['src/pages/galleries/*/index.md'])
		.sort((a, b) => sortOrderThenAlpha(a, b));
