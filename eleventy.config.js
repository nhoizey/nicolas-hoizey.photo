/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */

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

	// ------------------------------------------------------------------------
	// Eleventy configuration
	// ------------------------------------------------------------------------

	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

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
