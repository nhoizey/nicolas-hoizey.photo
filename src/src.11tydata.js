const fs = require('fs');
const config = require('../pack11ty.config.js');

module.exports = {
  lang: config.defaultLang || 'en',
  eleventyComputed: {
    layout: (data) => {
      if (data.layout !== undefined && data.layout !== '') {
        // A layout has been set in the content Front Matter
        return data.layout;
      }

      // Default layout is a page
      let layout = 'page';

      // Photos have their own layout
      if (data.page.url.match(/^\/photos\/[^/]+\//)) {
        return 'photo';
      }

      // Let's find if this content is in a collection folder
      // (a root folder without a '_' prefix)
      const folderRegex = new RegExp(`^./${config.dir.src}/([^_][^/]+)/.*$`);
      let matches = data.page.inputPath.match(folderRegex);

      if (matches) {
        if (!data.page.filePathStem.endsWith('/index')) {
          // This content is a photo
          layout = 'photo';
        } else {
          // This is a folder, use the layout of the collection if it exists
          folder = matches[1];
          if (fs.existsSync(`${config.dir.src}/_layouts/${folder}.njk`)) {
            layout = folder;
          }
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
