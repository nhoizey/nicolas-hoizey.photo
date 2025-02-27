import fs from "node:fs";
import { getUniquePhotos } from "../_utils/photoCollections.js";
import slugify from "../_utils/slugify.js";

export const brands = (collection) => {
	const brands = [];
	const brandNames = [];

	for (const item of getUniquePhotos(collection)) {
		const photoData = item.data.origin.data;
		const newBrands = [];
		if (photoData.gear?.camera?.brand !== undefined) {
			newBrands.push(photoData.gear.camera.brand);
		}
		if (photoData.gear?.lenses?.length > 0) {
			photoData.gear.lenses.forEach((lenseInfo, lense) => {
				newBrands.push(lenseInfo.brand);
			});
		}
		for (const brand of newBrands) {
			if (!brandNames.includes(brand)) {
				brandNames.push(brand);

				const newBrand = {
					brand: brand,
					slug: slugify(brand),
				};

				const brandLogoPath = `images/brands/${slugify(brand)}.png`;
				if (fs.existsSync(`src/static/${brandLogoPath}`)) {
					newBrand.logo = brandLogoPath;
				}

				const brandContentPath = `src/_includes/gear/${slugify(brand)}.md`;
				if (fs.existsSync(brandContentPath)) {
					newBrand.description = fs.readFileSync(brandContentPath, {
						encoding: "utf8",
					});
				}

				brands.push(newBrand);
			}
		}
	}

	brands.sort((a, b) => {
		return a.brand.localeCompare(b.brand, "en", { ignorePunctuation: true });
	});

	return brands;
};
