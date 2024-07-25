module.exports = {
	eleventyComputed: {
		layout: (data) => {
			if (data.layout !== undefined && data.layout !== '') {
				// A layout has been set in the content Front Matter
				return data.layout;
			}

			if (data.page.filePathStem.match(/^\/pages\/galleries\/[^\/]+/)) {
				if (data.page.filePathStem.endsWith('/index')) {
					return 'galleries';
				}
				return 'photos';
			}

			return 'pages';
		},
	},
};
