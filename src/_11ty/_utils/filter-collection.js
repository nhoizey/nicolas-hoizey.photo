const filteredCollectionsMemoization = {};

const getFilteredCollection = (collection, folder) => {
	if (folder in filteredCollectionsMemoization) {
		// This collection already exists in memoization
		return filteredCollectionsMemoization[folder];
	}
	const filteredCollection = collection
		.getFilteredByGlob(`src/${folder}/**/*.md`)
		.filter(
			(item) =>
				!item.filePathStem.match(/^\/[^\/]+\/index$/) &&
				(item.page.date <= Date.now() ||
					process.env.ELEVENTY_RUN_MODE !== "build"),
		)
		.sort((a, b) => b.date - a.date);
	// Keep a copy of this collection in memoization for later reuse
	filteredCollectionsMemoization[folder] = filteredCollection;

	return filteredCollection;
};

export default getFilteredCollection;
