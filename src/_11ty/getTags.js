import fs from 'node:fs';
import glob from 'fast-glob';
import slugify from './_utils/slugify.js';

const usedPhotosGlob = glob.sync('src/pages/galleries/**/*.md', {
	ignore: 'src/pages/galleries/**/index.md',
});

const averageColors = (colors) => {
	let averageColors = {};
	let colorsNumber = colors.length;

	[
		'vibrant',
		'darkVibrant',
		'lightVibrant',
		'muted',
		'darkMuted',
		'lightMuted',
	].forEach((colorName) => {
		// Compute average color
		// https://sighack.com/post/averaging-rgb-colors-the-right-way
		let colorsSum = { r: 0, g: 0, b: 0 };

		colors.forEach((color) => {
			const [r, g, b] = color[colorName].split(' ');
			colorsSum.r = colorsSum.r + Math.pow(parseInt(r, 10), 2);
			colorsSum.g = colorsSum.g + Math.pow(parseInt(g, 10), 2);
			colorsSum.b = colorsSum.b + Math.pow(parseInt(b, 10), 2);
		});

		let colorArray = [
			Math.round(Math.sqrt(colorsSum.r / colorsNumber)),
			Math.round(Math.sqrt(colorsSum.g / colorsNumber)),
			Math.round(Math.sqrt(colorsSum.b / colorsNumber)),
		].map((component) => component.toString(16).padStart(2, '0'));

		let colorString = `#${colorArray.join('')}`;

		averageColors[colorName] = colorString;
	});

	return averageColors;
};

export default function (collection) {
	let tagsCollection = new Map();
	const fileSlugs = [];

	collection.getFilteredByGlob(usedPhotosGlob).forEach(function (item) {
		const photoData = item.data.origin.data;
		if (!fileSlugs.includes(item.page.fileSlug)) {
			// Don't count multiple times the same photo in multiple folders
			fileSlugs.push(item.page.fileSlug);
			if ('tags' in photoData) {
				for (const tag of photoData.tags) {
					let tagData = tagsCollection.get(tag) || { number: 0, colors: [] };
					tagData.number = tagData.number + 1;
					tagData.colors.push(photoData.colors);
					tagsCollection.set(tag, tagData);
				}
			}
		}
	});

	const tags = [];
	const slugs = [];
	tagsCollection.forEach((tagData, tag) => {
		let tagLog = Math.log(tagData.number);
		let tagSlug = slugify(tag);
		if (slugs.includes(tagSlug)) {
			let counter = 1;
			while (slugs.includes(`${tagSlug}-${counter}`)) {
				counter++;
			}
			tagSlug = `${tagSlug}-${counter}`;
		}
		slugs.push(tagSlug);

		let newTag = {
			tag: tag,
			slug: tagSlug,
			number: tagData.number,
			log: tagLog,
			colors: averageColors(tagData.colors),
		};

		let tagLogoPath = `assets/logos/${tagSlug}.png`;
		if (fs.existsSync(`src/${tagLogoPath}`)) {
			newTag.logo = tagLogoPath;
		}

		let tagContentPath = `src/_includes/tags/${tagSlug}.md`;
		if (fs.existsSync(tagContentPath)) {
			newTag.description = fs.readFileSync(tagContentPath, {
				encoding: 'utf8',
			});
		}

		tags.push(newTag);
	});

	tags.sort((a, b) => {
		return a.tag.localeCompare(b.tag, 'en', { ignorePunctuation: true });
	});

	return tags;
}
