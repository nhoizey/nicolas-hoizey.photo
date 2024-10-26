import {
	getPhotos,
	getUniquePhotos,
	getPhotosInGalleries,
	getPhotosNotInGalleries,
} from '../_utils/photoCollections.js';

export const photos = (collection) => getPhotos(collection);

export const photos_in_galleries = (collection) =>
	getPhotosInGalleries(collection);

export const photos_not_in_galleries = (collection) =>
	getPhotosNotInGalleries(collection);

export const unique_photos = (collection) => getUniquePhotos(collection);
