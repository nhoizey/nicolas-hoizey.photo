const runDiaporama = async () => {
  // Load galleries images if motion is accepted
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    // wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Load all images
    document.querySelectorAll('.diaporama').forEach((element) => {
      // Run animations
      element.classList.add('run');

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
  }
};

runDiaporama();
