const glob = require('fast-glob');
const path = require('path');
const config = require('./pack11ty.config.js');

module.exports = function (eleventyConfig) {
  // ------------------------------------------------------------------------
  // Collections
  // ------------------------------------------------------------------------

  glob
    .sync(path.join(config.dir.src, '_11ty/collections/*.js'))
    .forEach((file) => {
      let collectionList = require('./' + file);
      Object.keys(collectionList).forEach((name) => {
        eleventyConfig.addCollection(name, collectionList[name]);
      });
    });

  // ------------------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------------------

  glob.sync(path.join(config.dir.src, '_11ty/filters/*.js')).forEach((file) => {
    let filters = require('./' + file);
    Object.keys(filters).forEach((name) => {
      eleventyConfig.addFilter(name, filters[name]);
    });
  });

  const exifr = require('exifr');
  const Fraction = require('fraction.js');
  const utf8 = require('utf8');
  const imageSize = require('image-size');

  eleventyConfig.addNunjucksAsyncFilter('exif', async (image, callback) => {
    const exifData = await exifr.parse(image, { iptc: true });

    // Add exposure time as a fraction
    if (exifData.ExposureTime) {
      let t = new Fraction(exifData.ExposureTime);
      exifData.ExposureTimeFraction = t.toFraction(true);
    }

    // Clean description
    if (exifData.ImageDescription) {
      exifData.ImageDescription = `<p>${exifData.ImageDescription.trim().replaceAll(
        '\n\n',
        '</p><p>'
      )}</p>`;
    }

    if (exifData.Make) {
      // Simpler make
      exifData.Make = exifData.Make.replace(
        'Konica Corporation',
        'Konica'
      ).replace('FUJI PHOTO FILM CO., LTD.', 'Fujifilm');
    }

    if (exifData.Model) {
      // Simpler model
      exifData.Model = exifData.Model.replace(
        'Konica Digital Camera ',
        ''
      ).replace('Canon EOS 5D Mark II', 'EOS 5D Mark II');
    }

    // clean UTF8 in keywords, and sort alphabeticaly
    if (exifData.Keywords) {
      exifData.Keywords = exifData.Keywords.map((keyword) =>
        utf8.decode(keyword)
      ).sort((a, b) => a.localeCompare(b, 'en'));
    }

    // Get image dimensions
    let imageDimensions = imageSize(image);
    exifData.ImageWidth = imageDimensions.width;
    exifData.ImageHeight = imageDimensions.height;

    callback(null, exifData);
  });

  // ------------------------------------------------------------------------
  // Shortcodes
  // ------------------------------------------------------------------------

  glob
    .sync(path.join(config.dir.src, '_11ty/shortcodes/*.js'))
    .forEach((file) => {
      let shortcodes = require('./' + file);
      Object.keys(shortcodes).forEach((name) => {
        eleventyConfig.addNunjucksShortcode(name, shortcodes[name]);
      });
    });

  glob
    .sync(path.join(config.dir.src, '_11ty/pairedShortcodes/*.js'))
    .forEach((file) => {
      let pairedShortcodes = require('./' + file);
      Object.keys(pairedShortcodes).forEach((name) => {
        eleventyConfig.addPairedShortcode(name, pairedShortcodes[name]);
      });
    });

  // ------------------------------------------------------------------------
  // Plugins
  // ------------------------------------------------------------------------

  const rss = require('@11ty/eleventy-plugin-rss');
  eleventyConfig.addPlugin(rss);

  // ------------------------------------------------------------------------
  // Transforms
  // ------------------------------------------------------------------------

  if (process.env.NODE_ENV === 'production') {
    const imagesResponsiver = require('eleventy-plugin-images-responsiver');
    const imagesResponsiverConfig = require(path.join(
      __dirname,
      config.dir.src,
      '_11ty/images-responsiver-config.js'
    ));
    eleventyConfig.addPlugin(imagesResponsiver, imagesResponsiverConfig);

    const htmlMinTransform = require(path.join(
      __dirname,
      config.dir.src,
      '_11ty/transforms/html-min-transform.js'
    ));
    eleventyConfig.addTransform('htmlmin', htmlMinTransform);
  }

  // ------------------------------------------------------------------------
  // Markdown plugins
  // ------------------------------------------------------------------------

  const markdownIt = require('markdown-it');
  const markdownItOptions = {
    html: true,
    breaks: true,
    linkify: true,
  };

  const markdownItFootnote = require('markdown-it-footnote');

  const slugify = require(path.join(
    __dirname,
    config.dir.src,
    '_11ty/_utils/slugify.js'
  ));
  const markdownItAnchor = require('markdown-it-anchor');
  // https://www.toptal.com/designers/htmlarrows/punctuation/section-sign/
  const markdownItAnchorOptions = {
    permalink: true,
    permalinkClass: 'deeplink',
    permalinkSymbol: '&#xa7;&#xFE0E;',
    level: [2, 3, 4],
    slugify: function (s) {
      return slugify(s);
    },
  };

  const markdownItAttributes = require('markdown-it-attrs');

  const markdownItSpan = require('markdown-it-bracketed-spans');

  const markdownItContainer = require('markdown-it-container');

  const markdownItAbbr = require('markdown-it-abbr');

  // taken from https://gist.github.com/rodneyrehm/4feec9af8a8635f7de7cb1754f146a39
  function getHeadingLevel(tagName) {
    if (tagName[0].toLowerCase() === 'h') {
      tagName = tagName.slice(1);
    }

    return parseInt(tagName, 10);
  }

  function markdownItHeadingLevel(md, options) {
    var firstLevel = options.firstLevel;

    if (typeof firstLevel === 'string') {
      firstLevel = getHeadingLevel(firstLevel);
    }

    if (!firstLevel || isNaN(firstLevel)) {
      return;
    }

    var levelOffset = firstLevel - 1;
    if (levelOffset < 1 || levelOffset > 6) {
      return;
    }

    md.core.ruler.push('adjust-heading-levels', function (state) {
      var tokens = state.tokens;
      for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].type !== 'heading_close') {
          continue;
        }

        var headingOpen = tokens[i - 2];
        var headingClose = tokens[i];

        var currentLevel = getHeadingLevel(headingOpen.tag);
        var tagName = 'h' + Math.min(currentLevel + levelOffset, 6);

        headingOpen.tag = tagName;
        headingClose.tag = tagName;
      }
    });
  }

  const md = markdownIt(markdownItOptions)
    .disable('code')
    .use(markdownItHeadingLevel, { firstLevel: 2 })
    .use(markdownItFootnote)
    .use(markdownItAnchor, markdownItAnchorOptions)
    .use(markdownItAttributes)
    .use(markdownItSpan)
    .use(markdownItAbbr)
    .use(markdownItContainer, 'info')
    .use(markdownItContainer, 'success')
    .use(markdownItContainer, 'warning')
    .use(markdownItContainer, 'error');
  eleventyConfig.setLibrary('md', md);

  // Add markdownify filter with Markdown-it configuration
  eleventyConfig.addFilter('markdownify', (markdownString) =>
    md.render(markdownString)
  );

  // ------------------------------------------------------------------------
  // Eleventy configuration
  // ------------------------------------------------------------------------

  eleventyConfig
    .addPassthroughCopy(path.join(config.dir.src, '**/*.{jpg,jpeg,png,gif}'))
    .addPassthroughCopy(path.join(config.dir.src, 'ui'))
    .addPassthroughCopy(path.join(config.dir.src, 'robots.txt'))
    .addPassthroughCopy(path.join(config.dir.src, 'favicon.ico'))
    .addPassthroughCopy(path.join(config.dir.src, '_headers'));

  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget('./ui/');

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.setQuietMode(true);

  eleventyConfig.setBrowserSyncConfig({
    ui: false,
    ghostMode: false,
    files: ['_site/ui/css/**/*.css', '_site/ui/js/**/*.js'],
  });

  return {
    templateFormats: ['md', 'njk'],

    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      output: config.dir.dist,
      input: config.dir.src,
      includes: '_includes',
      layouts: '_layouts',
      data: '_data',
    },
  };
};
