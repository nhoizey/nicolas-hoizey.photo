let isKenBurnsLoaded = false;

const loadKenBurns = async () => {
	// Load Ken Burns images diaporama if motion is accepted
	if (
		!isKenBurnsLoaded &&
		window.matchMedia("(prefers-reduced-motion: no-preference)").matches
	) {
		// wait for 3 seconds
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Load all images
		for (const element of document.querySelectorAll(".kenburns")) {
			// Load and animate lazy images
			for (const image of element.querySelectorAll("img[data-srcset]")) {
				image.setAttribute("srcset", image.dataset.srcset);
				delete image.dataset.srcset;
			}
			for (const image of element.querySelectorAll("img[data-src]")) {
				image.setAttribute("src", image.dataset.src);
				delete image.dataset.src;
			}
		}

		isKenBurnsLoaded = true;
	}
};

const runKenBurns = () => {
	loadKenBurns();
	document.querySelector("body").classList.add("run_kenburns");
};

const stopKenBurns = () => {
	document.querySelector("body").classList.remove("run_kenburns");
};

const toggleKenBurnsRunningState = () => {
	if (document.hidden) {
		stopKenBurns();
	} else {
		runKenBurns();
	}
};

if (typeof document.hidden === "undefined") {
	// No support for the Page Visibility API
	runKenBurns();
} else {
	// Run the kenburnss only if the page is visible
	if (!document.hidden) {
		runKenBurns();
	}

	// Add an event listener for page visibility change
	document.addEventListener(
		"visibilitychange",
		toggleKenBurnsRunningState,
		false,
	);
}
