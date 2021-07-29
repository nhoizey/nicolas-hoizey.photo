const fs = require('fs');
const config = require('../pack11ty.config.js');
const getPhotoData = require('./_11ty/_utils/photo-data');
const photoCollections = require('./_11ty/_utils/photo-collections');

// TODO: use photoCollections
const isPhoto = (data) =>
  data.page.filePathStem.match(
    /^\/(nature|urban|travels|portraits|misc)\/[^\/]+/
  ) && !data.page.filePathStem.endsWith('/index');

module.exports = {
  lang: config.defaultLang || 'en',
  eleventyComputed: {
    origin: (data) => {
      if (isPhoto(data)) {
        return getPhotoData(data.page.fileSlug);
      } else {
        return null;
      }
    },
    date: (data) => {
      if (isPhoto(data)) {
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
      if (isPhoto(data)) {
        const photoData = getPhotoData(data.page.fileSlug);
        return photoData.data.title;
      }
    },
    layout: (data) => {
      if (data.layout !== undefined && data.layout !== '') {
        // A layout has been set in the content Front Matter
        return data.layout;
      }

      // Default layout is a page
      let layout = 'page';

      // Photos have their own layout
      if (data.page.url.match(/^\/photos\/[^/]+\//) || isPhoto(data)) {
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
      if (config.permalinkFolders) {
        // Keep Eleventy default behavior for permalinks
        return data.page.filePathStem.replace(/\/index$/, '') + '/index.html';
      } else {
        return data.page.filePathStem + '.html';
      }
    },
  },
};
