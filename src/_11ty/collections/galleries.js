import sortOrderThenAlpha from '../_utils/sort-order-then-alpha.js';

const galleriesGlob = 'src/pages/galleries/**/index.md';

let galleriesList = undefined;
const getGalleries = (collection) => {
	if (galleriesList !== undefined) {
		return galleriesList;
	}
	galleriesList = collection
		.getFilteredByGlob(galleriesGlob)
		.sort((a, b) => sortOrderThenAlpha(a, b));
	return galleriesList;
};

export const photo_galleries = (collection) => getGalleries(collection);
