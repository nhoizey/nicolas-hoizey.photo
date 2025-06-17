import glob from "fast-glob";

export const photosGlob = "src/collections/photos/*/index.md";
export const usedPhotosGlob = glob.sync("src/pages/galleries/**/*.md", {
	ignore: "src/pages/galleries/**/index.md",
});

export const ignoredSlugs = [
	"monochrome",
	"grignotage",
	"gouter-d-enfant",
	"gourmandise",
];

let photos;
export const getPhotos = (collection) => {
	if (photos !== undefined) {
		return photos;
	}
	photos = collection.getFilteredByGlob(photosGlob);
	return photos;
};

let uniquePhotos;
export const getUniquePhotos = (collection) => {
	if (uniquePhotos !== undefined) {
		return uniquePhotos;
	}

	const distinctPhotosSlugs = [];
	uniquePhotos = getPhotosInGalleries(collection)
		.sort((a, _b) => {
			// Put travel photos first
			return a.page.filePathStem.match("/travels/") ? -1 : 1;
		})
		.filter((item) => {
			if (distinctPhotosSlugs.includes(item.page.fileSlug)) {
				return false;
			}
			distinctPhotosSlugs.push(item.page.fileSlug);
			return true;
		});

	return uniquePhotos;
};

let photosInGalleries;
export const getPhotosInGalleries = (collection) => {
	if (photosInGalleries !== undefined) {
		return photosInGalleries;
	}
	photosInGalleries = collection.getFilteredByGlob(usedPhotosGlob);
	return photosInGalleries;
};

let photosInGalleriesSlugs;
export const getPhotosInGalleriesSlugs = (collection) => {
	if (photosInGalleriesSlugs !== undefined) {
		return photosInGalleriesSlugs;
	}
	photosInGalleriesSlugs = getPhotosInGalleries(collection).map(
		(item) => item.page.fileSlug,
	);
	return photosInGalleriesSlugs;
};

let photosNotInGalleries;
export const getPhotosNotInGalleries = (collection) => {
	if (photosNotInGalleries !== undefined) {
		return photosNotInGalleries;
	}
	const photosToIgnore = [
		...ignoredSlugs,
		...getPhotosInGalleriesSlugs(collection),
	];
	photosNotInGalleries = getPhotos(collection).filter(
		(item) => !photosToIgnore.includes(item.page.fileSlug),
	);
	return photosNotInGalleries;
};
