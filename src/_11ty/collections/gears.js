import fs from "node:fs";
import { usedPhotosGlob } from "../_utils/photoCollections.js";
import slugify from "../_utils/slugify.js";

export const gears = (collection) => {
	const gearsCollection = new Map();
	const fileSlugs = [];

	for (const item of collection.getFilteredByGlob(usedPhotosGlob)) {
		const photoData = item.data.origin.data;
		if (!fileSlugs.includes(item.page.fileSlug)) {
			// Don't count multiple times the same photo in multiple folders
			fileSlugs.push(item.page.fileSlug);
			if ("gear" in photoData) {
				gearsCollection.set(
					`${photoData.gear.camera.brand} ${photoData.gear.camera.model}`,
					{
						type: "camera",
						brand: photoData.gear.camera.brand,
						model: photoData.gear.camera.model,
					},
				);
				if (photoData.gear.lenses?.length > 0) {
					photoData.gear.lenses.forEach((lenseInfo, lense) => {
						gearsCollection.set(`${lenseInfo.brand} ${lenseInfo.model}`, {
							type: "lense",
							brand: lenseInfo.brand,
							model: lenseInfo.model,
						});
					});
				}
			}
		}
	}

	const gearsList = [];
	const slugs = [];
	gearsCollection.forEach((gearData, gear) => {
		let gearSlug = `${slugify(gearData.brand)}/${slugify(gearData.model)}`;
		if (slugs.includes(gearSlug)) {
			let counter = 1;
			while (slugs.includes(`${gearSlug}-${counter}`)) {
				counter++;
			}
			gearSlug = `${gearSlug}-${counter}`;
		}
		slugs.push(gearSlug);

		const newGear = {
			gear: gear,
			slug: gearSlug,
			type: gearData.type,
			brand: gearData.brand,
			model: gearData.model,
		};

		const gearPhotoPath = `assets/gear/${gearSlug}.png`;
		if (fs.existsSync(`src/${gearPhotoPath}`)) {
			newGear.photo = gearPhotoPath;
		}

		const gearContentPath = `src/_includes/gear/${gearSlug}.md`;
		if (fs.existsSync(gearContentPath)) {
			newGear.description = fs.readFileSync(gearContentPath, {
				encoding: "utf8",
			});
		}

		gearsList.push(newGear);
	});

	gearsList.sort((a, b) => {
		return `${a.brand} ${a.model}`.localeCompare(
			`${b.brand} ${b.model}`,
			"en",
			{ ignorePunctuation: true },
		);
	});

	return gearsList;
};
