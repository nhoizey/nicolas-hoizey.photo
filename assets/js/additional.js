const { lte } = require('lodash');

let isDiaporamaLoaded = false;

const loadDiaporama = async () => {
  // Load diaporama images if motion is accepted
  if (
    !isDiaporamaLoaded &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  ) {
    // wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Load all images
    document.querySelectorAll('.diaporama').forEach((element) => {
      // Load and animate lazy images
      element.querySelectorAll('img[data-srcset]').forEach((image) => {
        image.setAttribute('srcset', image.dataset.srcset);
        delete image.dataset.srcset;
      });
      element.querySelectorAll('img[data-src]').forEach((image) => {
        image.setAttribute('src', image.dataset.src);
        delete image.dataset.src;
      });
    });

    isDiaporamaLoaded = true;
  }
};

const runDiaporama = () => {
  loadDiaporama();
  document.querySelector('body').classList.add('run_diaporamas');
};

const stopDiaporama = () => {
  document.querySelector('body').classList.remove('run_diaporamas');
};

const toggleDiaporamaRunningState = () => {
  if (document.hidden) {
    stopDiaporama();
  } else {
    runDiaporama();
  }
};

if (typeof document.hidden === 'undefined') {
  // No support for the Page Visibility API
  runDiaporama();
} else {
  // Run the diaporamas only if the page is visible
  if (!document.hidden) {
    runDiaporama();
  }

  // Add an event listener for page visibility change
  document.addEventListener(
    'visibilitychange',
    toggleDiaporamaRunningState,
    false
  );
}
