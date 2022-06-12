// Load galleries images if motion is accepted
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  document.querySelectorAll('.diaporama').forEach((element) => {
    element.querySelectorAll('img[data-srcset]').forEach((image) => {
      image.setAttribute('srcset', image.dataset.srcset);
      delete image.dataset.srcset;
    });
    element.querySelectorAll('img[data-src]').forEach((image) => {
      image.setAttribute('src', image.dataset.src);
      delete image.dataset.src;
    });
    element.classList.add('loaded');
  });
}
