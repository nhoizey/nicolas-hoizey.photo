const site = require('../_data/site');
const imageSize = require('image-size');
const markdownIt = require('markdown-it');
const md = new markdownIt();
const config = require('../../pack11ty.config.js');
const path = require('path');

const runBeforeHook = (image, document) => {
  let documentBody = document.querySelector('body');
  let srcPath = documentBody.getAttribute('data-img-src');

  let distRegex = new RegExp(`^${config.dir.dist}`);

  let distPath = documentBody
    .getAttribute('data-img-dist')
    .replace(distRegex, '');

  let imageSrc = image.getAttribute('src');
  let imageUrl = '';

  if (imageSrc.match(/^(https?:)?\/\//)) {
    // TODO: find a way to get a remote image's dimensions
    // TODO: some images are local but have an absolute URL
    imageUrl = imageSrc;
  } else {
    if (!image.getAttribute('width') || !image.getAttribute('height')) {
      let imageDimensions;
      if (imageSrc[0] === '/') {
        imageDimensions = imageSize(path.join(config.dir.src + imageSrc));
      } else {
        // This is a relative URL
        imageDimensions = imageSize(path.join(srcPath + imageSrc));
      }
      image.setAttribute('width', imageDimensions.width);
      image.setAttribute('height', imageDimensions.height);
    }
    if (imageSrc[0] === '/') {
      imageUrl = site.url.replace(/\/$/, '') + imageSrc;
    } else {
      // This is a relative URL
      imageUrl = site.url.replace(/\/$/, '') + distPath + imageSrc;
    }
    image.setAttribute('src', imageUrl);
  }

  if (!('responsiver' in image.dataset) && image.className) {
    image.dataset.responsiver = image.className;
  }
};

const runAfterHook = (image, document) => {
  let imageUrl =
    image.getAttribute('data-pristine') || image.getAttribute('src');
  let caption = image.getAttribute('title');

  if (caption !== null) {
    caption = md.render(caption.trim());
  }

  let zoom = [...image.classList].indexOf('zoom') !== -1;

  if (caption || zoom) {
    const figure = document.createElement('figure');
    figure.classList.add(...image.classList);
    // TODO: decide weither classes should be removed from the image or not
    image.classList.remove(...image.classList);
    let figCaption = document.createElement('figcaption');
    figCaption.innerHTML =
      (caption ? caption : '') +
      (zoom
        ? `<p class="zoom">&#128269; See <a href="${imageUrl}">full size</a></p>`
        : '');
    figure.appendChild(image.cloneNode(true));
    figure.appendChild(figCaption);

    image.replaceWith(figure);
  }
};

module.exports = {
  default: {
    selector:
      ':not(picture) img[src]:not([srcset]):not([src*=".svg"]):not([data-responsiver="false"])',
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,w_${width},c_limit/${src}`,
    runBefore: runBeforeHook,
    runAfter: runAfterHook,
    fallbackWidth: 800,
    minWidth: 360,
    maxWidth: 1600,
    sizes: '(max-width: 67rem) 90vw, 60rem',
    attributes: {
      crossorigin: 'anonymous',
    },
  },
  landscape: {
    maxWidth: 3500,
    steps: 7,
    sizes:
      '(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
    figure: 'never',
  },
  portrait: {
    maxWidth: 3500,
    steps: 7,
    sizes:
      '(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
    figure: 'never',
  },
  diaporama: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,g_auto,w_${width},ar_3:2,c_fill/${src}`,
    fallbackWidth: 384,
    minWidth: 384, // 320 * 1.2
    maxWidth: 768, // No need for more than 2dppx
    steps: 3,
    sizes: '(min-width: 22rem) calc(1.2 * 20rem), calc(1.2 * (100vw - 2rem))',
    figure: 'never',
  },
  thumbnail: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,w_${width},ar_1:1,c_fit/${src}`,
    fallbackWidth: 320,
    minWidth: 320,
    maxWidth: 640, // No need for more than 2dppx
    steps: 3,
    sizes: '(min-width: 22rem) 20rem, calc(100vw - 2rem)',
    figure: 'never',
  },
  photo_map: {
    fallbackWidth: 300,
    minWidth: 300,
    maxWidth: 450, // The source image is 450px wide
    steps: 2,
    sizes: '300px',
    figure: 'never',
  },
  logo: {
    fallbackWidth: 200,
    minWidth: 200,
    maxWidth: 400, // Enough for >= 2dppx
    steps: 3,
    sizes: '200px',
    figure: 'never',
  },
};
