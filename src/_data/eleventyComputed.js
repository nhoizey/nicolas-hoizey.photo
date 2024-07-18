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
  lang: config.defaultLang || 'en',
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
  // platforms: (data) => {
  //   if (isPhotoInGallery(data)) {
  //     const photoData = getPhotoData(data.page.fileSlug);
  //     return photoData.platforms;
  //   }
  //   return {};
  // },
  interestingness: (data) => {
    if (isPhotoInGallery(data)) {
      const photoData = getPhotoData(data.page.fileSlug);
      return photoData.interestingness || 0;
    }
    return 0;
  },
  layout: (data) => {
    if (data.layout !== undefined && data.layout !== '') {
      // A layout has been set in the content Front Matter
      return data.layout;
    }

    // Default layout is a page
    let layout = 'page';

    // Photos have their own layout
    if (isPhotoInPhotos(data)) {
      if (process.env.NODE_ENV === 'production') {
        return false;
      } else {
        return 'photo';
      }
    }

    // Photos have their own layout
    if (isPhotoInGallery(data)) {
      return 'photo';
    }

    // Let's find if this content is in a collection folder
    // (a root folder without a '_' prefix)
    const folderRegex = new RegExp(`^./${config.dir.src}/([^_][^/]+)/.*$`);
    let matches = data.page.inputPath.match(folderRegex);

    if (matches) {
      // This is a folder, use the layout of the collection if it exists
      folder = matches[1];
      if (fs.existsSync(`${config.dir.src}/_layouts/${folder}.njk`)) {
        layout = folder;
      }
    }
    return layout;
  },
  permalink: (data) => {
    if (data.permalink) {
      // A permalink has been set in the content Front Matter
      return data.permalink;
    }
    if (process.env.NODE_ENV === 'production' && isPhotoInPhotos(data)) {
      return false;
    }
    if (config.permalinkFolders) {
      // Keep Eleventy default behavior for permalinks
      return data.page.filePathStem.replace(/\/index$/, '') + '/index.html';
    } else {
      return data.page.filePathStem + '.html';
    }
  },
};
