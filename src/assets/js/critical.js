((window) => {
	// Add a class if Container Queries are supported
	// Inspired by https://supportscss.dev/
	if (window.CSSContainerRule) {
		window.document.documentElement.classList.add("supports-at-container");
	}

	// Style for Mapbox
	window.mapboxStyle = "mapbox/outdoors-v11";
})(window);
