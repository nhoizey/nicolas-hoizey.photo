module.exports = {
	eleventyComputed: {
		layout: (data) => {
			if (data.layout !== undefined && data.layout !== '') {
				// A layout has been set in the content Front Matter
				return data.layout;
			}

			if (data.page.filePathStem.match(/^\/collections\/photos\/[^\/]+/)) {
				if (process.env.NODE_ENV === 'production') {
					// There is no photo page in production, they redirect to a gallery photo
					return false;
				}
				return 'photo';
			}

			return 'page';
		},
	},
};
