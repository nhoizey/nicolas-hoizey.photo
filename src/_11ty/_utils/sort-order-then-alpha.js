// Sort items with `order` before others
export default (a, b) => {
	if (a.data.nav?.order) {
		if (b.data.nav?.order) {
			return (
				Number.parseInt(a.data.nav.order, 10) -
				Number.parseInt(b.data.nav.order, 10)
			);
		}
		return -1;
	}
	if (b.data.nav?.order) {
		return 1;
	}
	return a.data.title.localeCompare(b.data.title, "en", {
		ignorePunctuation: true,
		sensitivity: "base",
	});
};
