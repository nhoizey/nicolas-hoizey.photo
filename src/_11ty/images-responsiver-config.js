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

  let isData = false;
  if (!image.hasAttribute('src')) {
    isData = true;
  }

  let imageSrc = image.getAttribute(isData ? 'data-src' : 'src');
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
    image.setAttribute(isData ? 'data-src' : 'src', imageUrl);
  }

  if (!('responsiver' in image.dataset) && image.className) {
    image.dataset.responsiver = image.className;
  }
};

const runAfterHook = (image, document) => {
  let isData = false;
  if (!image.hasAttribute('src')) {
    isData = true;
  }

  let imageUrl =
    image.getAttribute('data-pristine') ||
    image.getAttribute(isData ? 'data-src' : 'src');
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
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,w_auto:50:${width},c_limit/${src}`,
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
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_jpg,fl_progressive:semi,w_auto:50:${width},c_limit/${src}`,
    maxWidth: 3500,
    steps: 7,
    sizes:
      '(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
    figure: 'never',
  },
  portrait: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_jpg,fl_progressive:semi,w_auto:50:${width},c_limit/${src}`,
    maxWidth: 3500,
    steps: 7,
    sizes:
      '(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
    figure: 'never',
  },
  diaporama: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,g_auto,w_auto:20:${width},ar_3:2,c_fill/${src}`,
    fallbackWidth: 375,
    minWidth: 375, // 18 * 16 * 1.3
    maxWidth: 1312, // No need for more than 2dppx
    steps: 5,
    // sizes: '(min-width: 20rem) calc(1.3 * 18rem), calc(1.3 * (100vw - 2rem))',
    // sizes:
    // '(min-width: 163.9375rem) calc(1.3 * (100vw - (9rem + 2vw + 1rem * 1.4 * 1.4 * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3rem * 6) / 7), (min-width: 142.5rem) calc(1.3 * (100vw - (9rem + 2vw + 1rem * 1.4 * 1.4 * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3rem * 5) / 6), (min-width: 121.0625rem) calc(1.3 * (100vw - (9rem + 2vw + 1rem * 1.4 * 1.4 * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3rem * 4) / 5), (min-width: 99.625rem) calc(1.3 * (100vw - (9rem + 2vw + 1rem * 1.4 * 1.4 * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3rem * 3) / 4), (min-width: 78.1875rem) calc(1.3 * (100vw - (9rem + 2vw + 1rem * 1.4 * 1.4 * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3rem * 2) / 3), (min-width: 60em) calc(1.3 * (100vw - (9rem + 2vw + 1rem * 1.4 * 1.4 * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3rem) / 2), (min-width: 41rem) calc(1.3 * (100vw - 2rem - 3rem) / 2), calc(1.3 * (100vw - 2rem))',
    sizes:
      '(min-width: 163.9375rem) calc(1.3 * (98vw - 36.408rem) / 7), (min-width: 142.5rem) calc(1.3 * (98vw - 33.408rem) / 6), (min-width: 121.0625rem) calc(1.3 * (98vw - 30.408rem) / 5), (min-width: 99.625rem) calc(1.3 * (98vw - 27.408rem) / 4), (min-width: 78.1875rem) calc(1.3 * (98vw - 24.408rem) / 3), (min-width: 60em) calc(1.3 * (98vw - 21.408rem) / 2), (min-width: 41rem) calc(1.3 * (50vw - 2.5rem)), calc(1.3 * (100vw - 2rem))',
    figure: 'never',
  },
  diaporama_large: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,g_auto,w_auto:20:${width},ar_3:2,c_fill/${src}`,
    fallbackWidth: 375,
    minWidth: 375, // 18 * 16 * 1.3
    maxWidth: 1640, // No need for more than 2dppx
    steps: 7,
    // sizes:
    //   '(min-width: 60rem) calc(1.3 * 39rem), (min-width: 20rem) calc(1.3 * 18rem), calc(1.3 * (100vw - 2rem))',
    sizes:
      '(min-width: 163.9375rem) calc(1.3 * (3rem + 2 * (98vw - 36.408rem) / 7)), (min-width: 142.5rem) calc(1.3 * (3rem + 2 * (98vw - 33.408rem) / 6)), (min-width: 121.0625rem) calc(1.3 * (3rem + 2 * (98vw - 30.408rem) / 5)), (min-width: 99.625rem) calc(1.3 * (3rem + 2 * (98vw - 27.408rem) / 4)), (min-width: 78.1875rem) calc(1.3 * (3rem + 2 * (98vw - 24.408rem) / 3)), (min-width: 60em) calc(1.3 * (3rem + 2 * (98vw - 21.408rem) / 2)), (min-width: 41rem) calc(1.3 * (50vw - 2.5rem)), calc(1.3 * (100vw - 2rem))',
    figure: 'never',
  },
  thumbnail_landscape: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,w_auto:20:${width},h_${Math.floor(
        (width / 3) * 2
      )},c_limit/${src}`,
    fallbackWidth: 320,
    minWidth: 320,
    maxWidth: 640, // No need for more than 2dppx
    steps: 4,
    sizes: '(min-width: 22rem) 20rem, calc(100vw - 2rem)',
    figure: 'never',
  },
  thumbnail_portrait: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,w_auto:20:${width},h_${Math.floor(
        (width / 2) * 3
      )},c_limit/${src}`,
    fallbackWidth: Math.floor((320 / 3) * 2),
    minWidth: Math.floor((320 / 3) * 2),
    maxWidth: Math.floor((640 / 3) * 2), // No need for more than 2dppx
    steps: 4,
    sizes:
      '(min-width: 22rem) calc(20rem / 2 * 3), calc((100vw - 2rem) / 2 * 3)',
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
