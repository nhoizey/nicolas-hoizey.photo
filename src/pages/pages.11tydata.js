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
		permalink: (data) => {
			if (data.permalink !== undefined && data.permalink !== '') {
				// A permalink has been set in the content Front Matter
				return data.permalink;
			}
			const path = data.page.filePathStem.replace(/^\/pages/, '');
			if (path.match(/^\/galleries\/[^\/]+/) && !path.endsWith('/index')) {
				return path + '/index.html';
			} else {
				return path.replace(/^/, '') + '.html';
			}
		},
	},
};
