const allBreadcrumbs = {};

const shuffle = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};

const chronoSort = (a, b) => {
	// Sort photos by creation date, not date of publication in galleries
	// Oldest first
	return a.data.origin.data.date - b.data.origin.data.date;
};

const getMinFocalLength = (lense) => {
	const minFocalLength = lense.model.replace(/^[^0-9]*([0-9.]+)[-m×].*$/, "$1");
	return Number.parseInt(minFocalLength, 10);
};

export const by_date = (collection) => collection.sort(chronoSort);

export const findBySlug = (collection, slug) => {
	// Inspired by @tylersticka
	// https://github.com/11ty/eleventy/issues/399#issuecomment-466514166
	const items = collection.filter((item) => item.page.fileSlug === slug);
	if (items.length === 1) {
		return items[0];
	}
	console.error(`Can't find content with slug "${slug}"`);
	return false;
};

export const taggued = (collection, tag) => {
	const slugs = [];
	return collection
		.filter((item) => {
			if (slugs.includes(item.page.fileSlug)) {
				return false;
			}
			slugs.push(item.page.fileSlug);
			return item.data.origin.data.tags?.includes(tag);
		})
		.sort(chronoSort);
};

export const shot_with = (photosCollection, gear) => {
	const slugs = [];
	return photosCollection
		.filter((photo) => {
			if (slugs.includes(photo.page.fileSlug)) {
				return false;
			}
			slugs.push(photo.page.fileSlug);
			const pageGear = photo.data.origin.data.gear;
			if (`${pageGear?.camera?.brand} ${pageGear?.camera?.model}` === gear) {
				return true;
			}
			if (pageGear?.lenses !== undefined) {
				let lenseFound = false;
				pageGear.lenses.forEach((data, lense) => {
					if (`${data.brand} ${data.model}` === gear) {
						lenseFound = true;
					}
				});
				return lenseFound;
			}
			return false;
		})
		.sort(chronoSort);
};

export const with_setting = (photosCollection, setting, value) => {
	const alreadySeenSlugs = [];
	return photosCollection
		.filter((photo) => {
			if (alreadySeenSlugs.includes(photo.page.fileSlug)) {
				return false;
			}
			alreadySeenSlugs.push(photo.page.fileSlug);
			if (
				photo.data.origin.data.settings !== undefined &&
				photo.data.origin.data.settings[setting] !== undefined &&
				photo.data.origin.data.settings[setting].readable === value
			) {
				return true;
			}
			return false;
		})
		.sort(chronoSort);
};

export const cameras = (collection, brand) =>
	collection.filter((gear) => gear.type === "camera" && gear.brand === brand);

export const lenses = (collection, brand) =>
	collection
		.filter((gear) => gear.type === "lense" && gear.brand === brand)
		.sort((a, b) => getMinFocalLength(a) - getMinFocalLength(b));

export const photos_here = (collection, url) =>
	collection
		.filter((item) => {
			const r = new RegExp(`^${url}[^/]+\/$`);
			return r.test(item.page.url);
		})
		.sort(chronoSort);

export const photos_here_and_below = (collection, url) => {
	const distinctPhotos = [];
	return collection
		.filter((item) => {
			const r = new RegExp(`^${url}[^/]+\/`);
			return r.test(item.page.url);
		})
		.filter((item) => {
			if (distinctPhotos.includes(item.page.fileSlug)) {
				return false;
			}
			distinctPhotos.push(item.page.fileSlug);
			return true;
		})
		.sort(chronoSort);
};

export const featured = (collection, number) => {
	const allFeatured = collection.filter((item) => item.data.featured);
	const featured = shuffle(allFeatured).slice(0, number);
	if (featured.length === number) {
		return featured;
	}

	const allNotFeatured = collection.filter((item) => !item.data.featured);
	const notFeatured = shuffle(allNotFeatured).slice(
		0,
		number - featured.length,
	);
	return [...featured, ...notFeatured];
};

export const not_featured = (collection) =>
	collection.filter((item) => !item.data.featured);

export const last_published_first = (collection) =>
	collection.sort((a, b) => {
		// Sort photos by date of publication in galleries
		return b.date - a.date;
	});

export const by_popularity = (collection) =>
	collection.sort((a, b) => {
		// Sort photos by computed popularity
		return b.data.interestingness - a.data.interestingness;
	});

export const sub_galleries = (collection, url) =>
	collection.filter((item) => {
		const r = new RegExp(`^${url}[^/]+\/$`);
		return r.test(item.page.url);
	});

export const breadcrumb = (collection, url) => {
	const breadcrumb = allBreadcrumbs[url];
	if (breadcrumb !== undefined) {
		return breadcrumb;
	}
	allBreadcrumbs[url] = collection
		.filter((item) => {
			return (
				item.page.url !== "/" &&
				item.page.url !== url &&
				url.startsWith(item.page.url)
			);
		})
		.sort((a, b) => {
			return a.url.length - b.url.length;
		});
	return allBreadcrumbs[url];
};

export const max_number = (collection) =>
	collection.reduce(
		(max_number, obj) => (max_number > obj.number ? max_number : obj.number),
		Number.NEGATIVE_INFINITY,
	);
