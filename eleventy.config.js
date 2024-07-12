/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */

const glob = require('fast-glob');
const path = require('node:path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = function (eleventyConfig) {
	const responsiverConfig = require(path.join(
		__dirname,
		'src/_11ty/images-responsiver-config.js'
	));

	const pack11tyPluginOptions = {
		responsiver: isProd && responsiverConfig,
		minifyHtml: isProd,
		markdown: {
			firstLevel: 2,
			containers: ['info', 'success', 'warning', 'error'],
		},
		collectionsLimit: isProd ? false : 10,
	};

	const pack11ty = require('eleventy-plugin-pack11ty');
	eleventyConfig.addPlugin(pack11ty, pack11tyPluginOptions);

	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

	// // ------------------------------------------------------------------------
	// // Collections
	// // ------------------------------------------------------------------------

	// // Initialize global variable to store a list of all photos
	// // Will be filed during computing of collections with getUniquePhotos() function
	let globalUniquePhotos = [];

	// glob.sync('src/_11ty/collections/*.js').forEach((file) => {
	// 	let collectionList = require('./' + file);
	// 	Object.keys(collectionList).forEach((name) => {
	// 		eleventyConfig.addCollection(name, collectionList[name]);
	// 	});
	// });

	// // ------------------------------------------------------------------------
	// // Filters
	// // ------------------------------------------------------------------------

	// glob.sync('src/_11ty/filters/*.js').forEach((file) => {
	// 	let filters = require('./' + file);
	// 	Object.keys(filters).forEach((name) => {
	// 		eleventyConfig.addFilter(name, filters[name]);
	// 	});
	// });

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
	// Transforms
	// ------------------------------------------------------------------------

	// if (isProd) {
	// 	// TODO: Add to eleventy-plugin-pack11ty?
	// 	eleventyConfig.addPlugin(require('eleventy-plugin-auto-preload'));
	// }

	// ------------------------------------------------------------------------
	// Eleventy configuration
	// ------------------------------------------------------------------------

	// eleventyConfig
	// 	.addPassthroughCopy(
	// 		'src/{assets,photos,galleries,blog}/**/*.{jpg,jpeg,png,gif}'
	// 	)
	// 	.addPassthroughCopy('src/ui')
	// 	.addPassthroughCopy('src/robots.txt')
	// 	.addPassthroughCopy('src/favicon.ico');

	// eleventyConfig.setUseGitIgnore(false);
	// eleventyConfig.addWatchTarget('./ui/');

	// eleventyConfig.setDataDeepMerge(true);
	// eleventyConfig.setQuietMode(true);

	// eleventyConfig.setServerOptions({
	// 	watch: ['_site/ui/css/**/*.css', '_site/ui/js/**/*.js'],
	// });

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
