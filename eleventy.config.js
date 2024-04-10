/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */

const glob = require('fast-glob');
const path = require('path');

module.exports = function (eleventyConfig) {
	// ------------------------------------------------------------------------
	// Collections
	// ------------------------------------------------------------------------

	// Initialize global variable to store a list of all photos
	// Will be filed during computing of collections with getUniquePhotos() function
	let globalUniquePhotos = [];

	glob.sync('src/_11ty/collections/*.js').forEach((file) => {
		let collectionList = require('./' + file);
		Object.keys(collectionList).forEach((name) => {
			eleventyConfig.addCollection(name, collectionList[name]);
		});
	});

	// ------------------------------------------------------------------------
	// Filters
	// ------------------------------------------------------------------------

	glob.sync('src/_11ty/filters/*.js').forEach((file) => {
		let filters = require('./' + file);
		Object.keys(filters).forEach((name) => {
			eleventyConfig.addFilter(name, filters[name]);
		});
	});

	// ------------------------------------------------------------------------
	// Shortcodes
	// ------------------------------------------------------------------------

	glob.sync('src/_11ty/shortcodes/*.js').forEach((file) => {
		let shortcodes = require('./' + file);
		Object.keys(shortcodes).forEach((name) => {
			eleventyConfig.addNunjucksShortcode(name, shortcodes[name]);
		});
	});

	// ------------------------------------------------------------------------
	// Plugins
	// ------------------------------------------------------------------------

	eleventyConfig.addPlugin(require('@11ty/eleventy-plugin-rss'));

	eleventyConfig.addPlugin(require('eleventy-plugin-embed-everything'), {
		youtube: {
			options: {
				lite: {
					css: {
						path: '/ui/js/yt-lite/lite-yt-embed.css',
					},
					js: {
						path: '/ui/js/yt-lite/lite-yt-embed.js',
					},
				},
			},
		},
	});

	// ------------------------------------------------------------------------
	// Transforms
	// ------------------------------------------------------------------------

	if (process.env.NODE_ENV === 'production') {
		eleventyConfig.addPlugin(
			require('eleventy-plugin-images-responsiver'),
			require(path.join(__dirname, 'src/_11ty/images-responsiver-config.js'))
		);

		// eleventyConfig.addTransform(
		//   'htmlmin',
		//   require(path.join(
		//     __dirname,
		//     'src/_11ty/transforms/html-min-transform.js'
		//   ))
		// );

		// eleventyConfig.addPlugin(require('eleventy-plugin-auto-preload'));
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

	const slugify = require(path.join(__dirname, 'src/_11ty/_utils/slugify.js'));
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

	// Add markdown paired shortcode with shared Markdown-it configuration
	eleventyConfig.addPairedShortcode(
		'markdown',
		(markdownString, inline = null) =>
			inline ? md.renderInline(markdownString) : md.render(markdownString)
	);

	// ------------------------------------------------------------------------
	// Eleventy configuration
	// ------------------------------------------------------------------------

	eleventyConfig
		.addPassthroughCopy(
			'src/{assets,photos,galleries,blog}/**/*.{jpg,jpeg,png,gif}'
		)
		.addPassthroughCopy('src/ui')
		.addPassthroughCopy('src/robots.txt')
		.addPassthroughCopy('src/favicon.ico');

	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.addWatchTarget('./ui/');

	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

	eleventyConfig.setServerOptions({
		watch: ['_site/ui/css/**/*.css', '_site/ui/js/**/*.js'],
	});

	// if (process.env.NODE_ENV === 'production') {
	//   eleventyConfig.ignores.add('src/tools/opengraph');
	// }

	// eleventyConfig.on('eleventy.contentMap', ({ inputPathToUrl }) => {
	// 	console.log(inputPathToUrl);
	// });

	return {
		templateFormats: ['md', 'njk'],

		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		dataTemplateEngine: 'njk',
		dir: {
			output: '_site',
			input: 'src',
			includes: '_includes',
			layouts: '_layouts',
			data: '_data',
		},
	};
};
