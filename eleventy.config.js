import path from "node:path";

import eleventyPluginPack11ty from "eleventy-plugin-pack11ty";

const isProd = process.env.ELEVENTY_RUN_MODE === "build";

export default async function (eleventyConfig) {
	const { responsiverConfig } = await import(
		path.join(import.meta.dirname, "src/_11ty/images-responsiver-config.js")
	);

	const pack11tyPluginOptions = {
		responsiver: isProd && responsiverConfig,
		minifyHtml: isProd,
		markdown: {
			firstLevel: 2,
			containers: ["info", "success", "warning", "error"],
		},
	};

	eleventyConfig.addPlugin(eleventyPluginPack11ty, pack11tyPluginOptions);

	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

	if (isProd) {
		eleventyConfig.ignores.add("./src/pages/tools/**");
	}

	eleventyConfig.setWatchJavaScriptDependencies(false);

	return {
		templateFormats: ["md", "njk"],

		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dataTemplateEngine: "njk",
		dir: {
			output: "_site",
			input: "src",
			includes: "_includes",
			layouts: "_layouts",
			data: "_data",
		},
	};
}
