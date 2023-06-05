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
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,w_auto:50:${width},c_limit/${src}`,
    maxWidth: 3500,
    steps: 7,
    sizes:
      '(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
    figure: 'never',
  },
  portrait: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,w_auto:50:${width},c_limit/${src}`,
    maxWidth: 3500,
    steps: 7,
    sizes:
      '(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
    figure: 'never',
  },
  evantail_large_front: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,g_auto,w_auto:20:${width},ar_3:2,c_fill/${src}`,
    fallbackWidth: 220,
    minWidth: 220, // 16 * 16 * 12/14
    maxWidth: 988, // (16 + 4 + 16) * 16 * 12/14 * 2 (no need for more than 2dppx)
    steps: 5,
    // sizes:
    // (min-width: 176.1875em)
    //   calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 7 * 4rem) / 8 * 2 + 4rem)),
    // (min-width: 155.75em)
    //   calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 6 * 4rem) / 7 * 2 + 4rem)),
    // (min-width: 135.375em)
    //   calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 5 * 4rem) / 6 * 2 + 4rem)),
    // (min-width: 114.9375em)
    //   calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4 * 4rem) / 5 * 2 + 4rem)),
    // (min-width: 94.5625em)
    //   calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3 * 4rem) / 4 * 2 + 4rem)),
    // (min-width: 74.4375em)
    //   calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 2 * 4rem) / 3 * 2 + 4rem)),
    // (min-width: 60em)
    //   calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4rem) / 2)),
    // (min-width: 58rem) calc(12 / 14 * (((100vw - 2rem - 2 * 4rem) / 3) * 2 + 4rem)),
    // (min-width: 38rem) calc(12 / 14 * ((100vw - 2rem - 4rem) / 2)),
    // calc(100vw - 2rem)
    sizes:
      '(min-width: 176.1875em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 7 * 4rem) / 8 * 2 + 4rem)), (min-width: 155.75em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 6 * 4rem) / 7 * 2 + 4rem)), (min-width: 135.375em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 5 * 4rem) / 6 * 2 + 4rem)), (min-width: 114.9375em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4 * 4rem) / 5 * 2 + 4rem)), (min-width: 94.5625em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3 * 4rem) / 4 * 2 + 4rem)), (min-width: 74.4375em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 2 * 4rem) / 3 * 2 + 4rem)), (min-width: 60em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4rem) / 2)), (min-width: 58rem) calc(12 / 14 * (((100vw - 2rem - 2 * 4rem) / 3) * 2 + 4rem)), (min-width: 38rem) calc(12 / 14 * ((100vw - 2rem - 4rem) / 2)), calc(100vw - 2rem)',
    figure: 'never',
  },
  evantail_large_back: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,g_auto,w_auto:20:${width},ar_3:2,c_fill/${src}`,
    fallbackWidth: 202,
    minWidth: 202, // 16 * 16 * 11/14
    maxWidth: 906, // (16 + 4 + 16) * 16 * 11/14 * 2 (no need for more than 2dppx)
    steps: 5,
    sizes:
      '(min-width: 176.1875em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 7 * 4rem) / 8 * 2 + 4rem)), (min-width: 155.75em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 6 * 4rem) / 7 * 2 + 4rem)), (min-width: 135.375em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 5 * 4rem) / 6 * 2 + 4rem)), (min-width: 114.9375em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4 * 4rem) / 5 * 2 + 4rem)), (min-width: 94.5625em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3 * 4rem) / 4 * 2 + 4rem)), (min-width: 74.4375em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 2 * 4rem) / 3 * 2 + 4rem)), (min-width: 60em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4rem) / 2)), (min-width: 58rem) calc(11 / 14 * (((100vw - 2rem - 2 * 4rem) / 3) * 2 + 4rem)), (min-width: 38rem) calc(11 / 14 * ((100vw - 2rem - 4rem) / 2)), calc(100vw - 2rem)',
    figure: 'never',
  },
  evantail_small_front: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,g_auto,w_auto:20:${width},ar_3:2,c_fill/${src}`,
    fallbackWidth: 220,
    minWidth: 220, // 16 * 16 * 12/14
    maxWidth: 439, // 16 * 16 * 12/14 * 2 (no need for more than 2dppx)
    steps: 5,
    sizes:
      '(min-width: 176.1875em) calc(12 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 7 * 4rem) / 8), (min-width: 155.75em) calc(12 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 6 * 4rem) / 7), (min-width: 135.375em) calc(12 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 5 * 4rem) / 6), (min-width: 114.9375em) calc(12 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4 * 4rem) / 5), (min-width: 94.5625em) calc(12 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3 * 4rem) / 4), (min-width: 74.4375em) calc(12 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 2 * 4rem) / 3), (min-width: 60em) calc(12 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4rem) / 2)), (min-width: 58rem) calc(12 / 14 * ((100vw - 2rem - 2 * 4rem) / 3)), (min-width: 38rem) calc(12 / 14 * ((100vw - 2rem - 4rem) / 2)), calc(100vw - 2rem)',
    figure: 'never',
  },
  evantail_small_back: {
    resizedImageUrl: (src, width) =>
      `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto,g_auto,w_auto:20:${width},ar_3:2,c_fill/${src}`,
    fallbackWidth: 202,
    minWidth: 202, // 16 * 16 * 11/14
    maxWidth: 402, // 16 * 16 * 11/14 * 2 (no need for more than 2dppx)
    steps: 5,
    sizes:
      '(min-width: 176.1875em) calc(11 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 7 * 4rem) / 8), (min-width: 155.75em) calc(11 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 6 * 4rem) / 7), (min-width: 135.375em) calc(11 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 5 * 4rem) / 6), (min-width: 114.9375em) calc(11 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4 * 4rem) / 5), (min-width: 94.5625em) calc(11 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 3 * 4rem) / 4), (min-width: 74.4375em) calc(11 / 14 * (100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 2 * 4rem) / 3), (min-width: 60em) calc(11 / 14 * ((100vw - (9rem + 2vw + 1rem * 2) - (1rem * 1.4 * 1.4 * 1.4 * 2) - 4rem) / 2)), (min-width: 58rem) calc(11 / 14 * ((100vw - 2rem - 2 * 4rem) / 3)), (min-width: 38rem) calc(11 / 14 * ((100vw - 2rem - 4rem) / 2)), calc(100vw - 2rem)',
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
