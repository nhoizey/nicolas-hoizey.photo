import fs from "node:fs";
import slugify from "./_utils/slugify.js";
import { getUniquePhotos } from "./_utils/photoCollections.js";

const averageColors = (colors) => {
	const averageColors = {};
	const colorsNumber = colors.length;

	const colorNames = [
		"vibrant",
		"darkVibrant",
		"lightVibrant",
		"muted",
		"darkMuted",
		"lightMuted",
	];

	for (const colorName of colorNames) {
		// Compute average color
		// https://sighack.com/post/averaging-rgb-colors-the-right-way
		const colorsSum = { r: 0, g: 0, b: 0 };

		for (const color of colors) {
			const [r, g, b] = color[colorName].split(" ");
			colorsSum.r = colorsSum.r + Number.parseInt(r, 10) ** 2;
			colorsSum.g = colorsSum.g + Number.parseInt(g, 10) ** 2;
			colorsSum.b = colorsSum.b + Number.parseInt(b, 10) ** 2;
		}

		const colorArray = [
			Math.round(Math.sqrt(colorsSum.r / colorsNumber)),
			Math.round(Math.sqrt(colorsSum.g / colorsNumber)),
			Math.round(Math.sqrt(colorsSum.b / colorsNumber)),
		].map((component) => component.toString(16).padStart(2, "0"));

		const colorString = `#${colorArray.join("")}`;

		averageColors[colorName] = colorString;
	}

	return averageColors;
};

export default function (collection) {
	const tagsCollection = new Map();

	for (const item of getUniquePhotos(collection)) {
		const photoData = item.data.origin.data;
		if ("tags" in photoData) {
			for (const tag of photoData.tags) {
				const tagData = tagsCollection.get(tag) || { number: 0, colors: [] };
				tagData.number = tagData.number + 1;
				tagData.colors.push(photoData.colors);
				tagsCollection.set(tag, tagData);
			}
		}
	}

	const tags = [];
	const slugs = [];
	tagsCollection.forEach((tagData, tag) => {
		const tagLog = Math.log(tagData.number);
		let tagSlug = slugify(tag);
		if (slugs.includes(tagSlug)) {
			let counter = 1;
			while (slugs.includes(`${tagSlug}-${counter}`)) {
				counter++;
			}
			tagSlug = `${tagSlug}-${counter}`;
		}
		slugs.push(tagSlug);

		const newTag = {
			tag: tag,
			slug: tagSlug,
			number: tagData.number,
			log: tagLog,
			colors: averageColors(tagData.colors),
		};

		const tagLogoPath = `assets/logos/${tagSlug}.png`;
		if (fs.existsSync(`src/${tagLogoPath}`)) {
			newTag.logo = tagLogoPath;
		}

		const tagContentPath = `src/_includes/tags/${tagSlug}.md`;
		if (fs.existsSync(tagContentPath)) {
			newTag.description = fs.readFileSync(tagContentPath, {
				encoding: "utf8",
			});
		}

		tags.push(newTag);
	});

	tags.sort((a, b) => {
		return a.tag.localeCompare(b.tag, "en", { ignorePunctuation: true });
	});

	return tags;
}
