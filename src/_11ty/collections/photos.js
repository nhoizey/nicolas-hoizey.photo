const glob = require('fast-glob').sync;

const ignoredSlugs = [
  'monochrome',
  'grignotage',
  'gouter-d-enfant',
  'gourmandise',
];

const photosGlob = 'src/collections/photos/*/index.md';
const usedPhotosGlob = glob('src/pages/galleries/**/*.md', {
	ignore: 'src/pages/galleries/**/index.md',
});

let photos = undefined;
const getPhotos = (collection) => {
	if (photos !== undefined) {
		return photos;
	}
	photos = collection.getFilteredByGlob(photosGlob);
	return photos;
};

let photosInGalleries = undefined;
const getPhotosInGalleries = (collection) => {
	if (photosInGalleries !== undefined) {
		return photosInGalleries;
	}
	photosInGalleries = collection.getFilteredByGlob(usedPhotosGlob);
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
	photos: (collection) => getPhotos(collection),
	photos_in_galleries: (collection) => getPhotosInGalleries(collection),
	photos_not_in_galleries: (collection) => {
		const photosToIgnore = [
			...ignoredSlugs,
			...getPhotosInGalleriesSlugs(collection),
		];
		return getPhotos(collection).filter(
			(item) => !photosToIgnore.includes(item.page.fileSlug)
		);
	},
	unique_photos: (collection) => {
		const distinctPhotosSlugs = [];
		globalUniquePhotos = getPhotosInGalleries(collection)
			.sort((a, b) => {
				// Put travel photos first
				return a.page.filePathStem.match('/travels/') ? -1 : 1;
			})
			.filter((item) => {
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
