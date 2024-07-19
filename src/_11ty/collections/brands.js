const fs = require('fs');
const glob = require('fast-glob').sync;
const slugify = require('../_utils/slugify');

const usedPhotosGlob = glob('src/pages/galleries/**/*.md', {
	ignore: 'src/pages/galleries/**/index.md',
});

module.exports = {
	brands: (collection) => {
		let brands = [];
		let brandNames = [];
		const fileSlugs = [];

		collection.getFilteredByGlob(usedPhotosGlob).forEach(function (item) {
			const photoData = item.data.origin.data;
			if (!fileSlugs.includes(item.page.fileSlug)) {
				// Don't count multiple times the same photo in multiple folders
				fileSlugs.push(item.page.fileSlug);
				const newBrands = [];
				if (photoData.gear?.camera?.brand !== undefined) {
					newBrands.push(photoData.gear.camera.brand);
				}
				if (photoData.gear?.lenses?.length > 0) {
					photoData.gear.lenses.forEach((lenseInfo, lense) => {
						newBrands.push(lenseInfo.brand);
					});
				}
				newBrands.forEach((brand) => {
					if (!brandNames.includes(brand)) {
						brandNames.push(brand);

						const newBrand = {
							brand: brand,
							slug: slugify(brand),
						};

						let brandLogoPath = `images/brands/${slugify(brand)}.png`;
						if (fs.existsSync(`src/static/${brandLogoPath}`)) {
							newBrand.logo = brandLogoPath;
						}

						let brandContentPath = `src/_includes/gear/${slugify(brand)}.md`;
						if (fs.existsSync(brandContentPath)) {
							newBrand.description = fs.readFileSync(brandContentPath, {
								encoding: 'utf8',
							});
						}

						brands.push(newBrand);
					}
				});
			}
		});

		brands.sort((a, b) => {
			return a.brand.localeCompare(b.brand, 'en', { ignorePunctuation: true });
		});

		return brands;
	},
};
