const fs = require('fs');
const pkg = require('../../package.json');
const config = require('../../pack11ty.config.js');
const getPhotoData = require('../_11ty/_utils/photo-data');

// TODO: use photoCollections
const isPhotoInGallery = (data) =>
	data.page.filePathStem.match(/^\/pages\/galleries\/[^\/]+/) &&
	!data.page.filePathStem.endsWith('/index');

const isPhotoInPhotos = (data) =>
	data.page.filePathStem.match(/^\/collections\/photos\/[^\/]+\/index/);

module.exports = {
	opengraph: {
		type: (data) => (data.page.url === '/' ? 'website' : 'article'),
		title: (data) => data.title,
		image: {
			title: (data) => {
				return data.page.url === '/' ? pkg.title : data.title;
			},
			tagline: (data) => 'blop',
		},
	},
	origin: (data) => {
		if (isPhotoInGallery(data)) {
			return getPhotoData(data.page.fileSlug);
		} else if (isPhotoInPhotos(data)) {
			return getPhotoData(
				data.page.filePathStem.replace(
					/^\/collections\/photos\/([^\/]+)\/index$/,
					'$1'
				)
			);
		} else {
			return null;
		}
	},
	date: (data) => {
		if (isPhotoInGallery(data)) {
			const photoData = getPhotoData(data.page.fileSlug);
			return photoData.data.date;
		} else {
			return data.date;
		}
	},
	title: (data) => {
		if (data.title !== undefined && data.title !== '') {
			// A title has been set in the content Front Matter
			return data.title;
		}
		if (isPhotoInGallery(data)) {
			const photoData = getPhotoData(data.page.fileSlug);
			return photoData.data.title;
		}
	},
	interestingness: (data) => {
		if (isPhotoInGallery(data)) {
			const photoData = getPhotoData(data.page.fileSlug);
			return photoData.interestingness || 0;
		}
		return 0;
	},
	permalink: (data) => {
		if (process.env.NODE_ENV === 'production' && isPhotoInPhotos(data)) {
			return false;
		}
		return data.permalink;
	},
};
