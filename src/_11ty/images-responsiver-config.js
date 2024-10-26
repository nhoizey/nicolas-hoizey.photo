import pkg from '../../package.json' with { type: 'json' };

import imageSize from 'image-size';
import markdownIt from 'markdown-it';
const md = new markdownIt();

const runBeforeHook = (image, document) => {
	let documentBody = document.querySelector('body');
	let srcPath = documentBody.getAttribute('data-img-src');
	let distPath = documentBody.getAttribute('data-img-dist');

	let isData = false;
	if (!image.hasAttribute('src')) {
		isData = true;
	}

	const imageSrc = image.getAttribute(isData ? 'data-src' : 'src');
	let imageUrl = '';

	if (imageSrc.match(/^(https?:)?\/\//)) {
		// TODO: find a way to get a remote image's dimensions
		// TODO: some images are local but have an absolute URL
		imageUrl = imageSrc;
	} else {
		if (!image.getAttribute('width') || !image.getAttribute('height')) {
			let imageDimensions;
			if (imageSrc[0] === '/') {
				// Fix images source paths
				const correctedImgSrc = imageSrc
					.replace(/^\/photos\//, '/collections/photos/')
					.replace(/^\/images\//, '/static/images/')
					.replace(/^\/ui\//, '/static/ui/');
				imageDimensions = imageSize('src' + correctedImgSrc);
			} else {
				// This is a relative URL
				imageDimensions = imageSize(srcPath + imageSrc);
			}
			image.setAttribute('width', imageDimensions.width);
			image.setAttribute('height', imageDimensions.height);
		}
		if (imageSrc[0] === '/') {
			imageUrl = pkg.homepage.replace(/\/$/, '') + imageSrc;
		} else {
			// This is a relative URL
			imageUrl =
				pkg.homepage.replace(/\/$/, '') +
				distPath.replace('./_site', '') +
				imageSrc;
		}

		image.setAttribute(isData ? 'data-src' : 'src', imageUrl);
	}

	if (!('responsiver' in image.dataset) && image.className) {
		image.dataset.responsiver = image.className;
	}
};

const runAfterHook = (image, document) => {
	let caption = undefined;

	// Extract `title` attribute of the image
	const title = image.getAttribute('title');

	// If there's a title value,
	//   parse it for Markdown content
	if (title !== null) {
		caption = md.render(title.trim());
	}

	// If there's a caption,
	//   add a `<figure>` around the image,
	//   with the caption in a `<figcaption>`
	if (caption) {
		let figure = document.createElement('figure');
		figure.classList.add(...image.classList);
		image.classList.remove(...image.classList);
		let figCaption = document.createElement('figcaption');
		figCaption.innerHTML = caption;
		figure.appendChild(image.cloneNode(true));
		figure.appendChild(figCaption);

		image.replaceWith(figure);
	}
};

export const responsiverConfig = {
	default: {
		resizedImageUrl: (src, width) =>
			`https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto/w_auto:breakpoints_360_1600_20_10:${width}/${src}`,
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
			`https://res.cloudinary.com/nho/image/fetch/q_auto,fl_progressive:semi/w_auto:breakpoints_360_3500_20_10:${width}/${src}`,
		maxWidth: 3500,
		steps: 7,
		sizes:
			'(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
		figure: 'never',
	},
	portrait: {
		resizedImageUrl: (src, width) =>
			`https://res.cloudinary.com/nho/image/fetch/q_auto,fl_progressive:semi/w_auto:breakpoints_360_3500_20_10:${width}/${src}`,
		maxWidth: 3500,
		steps: 7,
		sizes:
			'(min-width: 60rem) calc(100vw - 2 * 1rem - 9rem - 2vw - 2 * 2.744rem), calc(100vw - 2rem)',
		figure: 'never',
	},
	evantail_large_front: {
		resizedImageUrl: (src, width) =>
			`https://res.cloudinary.com/nho/image/fetch/ar_3:2,g_auto,c_fill/q_auto,f_auto/w_auto:breakpoints_220_988_20_10:${width}/${src}`,
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
			`https://res.cloudinary.com/nho/image/fetch/ar_3:2,g_auto,c_fill/q_auto,f_auto/w_auto:breakpoints_202_906_20_10:${width}/${src}`,
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
			`https://res.cloudinary.com/nho/image/fetch/ar_3:2,g_auto,c_fill/q_auto,f_auto/w_auto:breakpoints_220_439_10_10:${width}/${src}`,
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
			`https://res.cloudinary.com/nho/image/fetch/ar_3:2,g_auto,c_fill/q_auto,f_auto/w_auto:breakpoints_202_402_10_10:${width}/${src}`,
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
			`https://res.cloudinary.com/nho/image/fetch/h_${Math.floor(
				(width / 3) * 2
			)},c_limit/q_auto,f_auto/w_auto:breakpoints_320_640_10_10:${width}/${src}`,
		fallbackWidth: 320,
		minWidth: 320,
		maxWidth: 640, // No need for more than 2dppx
		steps: 4,
		sizes: '(min-width: 22rem) 20rem, calc(100vw - 2rem)',
		figure: 'never',
	},
	thumbnail_portrait: {
		resizedImageUrl: (src, width) =>
			`https://res.cloudinary.com/nho/image/fetch/h_${Math.floor(
				(width / 2) * 3
			)},c_limit/q_auto,f_auto/w_auto:breakpoints_214_427_10_10:${width}/${src}`,
		fallbackWidth: 214,
		minWidth: 214,
		maxWidth: 427, // No need for more than 2dppx
		steps: 4,
		sizes:
			'(min-width: 22rem) calc(20rem / 2 * 3), calc((100vw - 2rem) / 2 * 3)',
		figure: 'never',
	},
	photo_map: {
		resizedImageUrl: (src, width) =>
			`https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto/w_auto:breakpoints_300_450_10_10:${width}/${src}`,
		fallbackWidth: 300,
		minWidth: 300,
		maxWidth: 450, // The source image is 450px wide
		steps: 2,
		sizes: '300px',
		figure: 'never',
	},
	logo: {
		resizedImageUrl: (src, width) =>
			`https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto/w_auto:breakpoints_200_400_10_10:${width}/${src}`,
		fallbackWidth: 200,
		minWidth: 200,
		maxWidth: 400, // Enough for >= 2dppx
		steps: 3,
		sizes: '200px',
		figure: 'never',
	},
};
