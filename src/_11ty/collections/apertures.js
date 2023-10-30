const fs = require('fs');
const slugify = require('../_utils/slugify');

const usedPhotosGlob = 'src/galleries/**/*.md';

module.exports = {
  apertures: (collection) => {
    let apertures = [];
    let aperturesObject = {};
    const photoSlugs = [];

    collection
      .getFilteredByGlob(usedPhotosGlob)
      .filter((item) => !item.filePathStem.endsWith('/index'))
      .forEach(function (item) {
        const photoData = item.data.origin.data;
        if (!photoSlugs.includes(item.page.fileSlug)) {
          // Don't count multiple times the same photo in multiple folders
          photoSlugs.push(item.page.fileSlug);
          if (photoData.settings?.aperture !== undefined) {
            if (aperturesObject[photoData.settings.aperture] !== undefined) {
              aperturesObject[photoData.settings.aperture]++;
            } else {
              aperturesObject[photoData.settings.aperture] = 1;
            }
          }
        }
      });

    for (const [aperture, number] of Object.entries(aperturesObject)) {
      const newAperture = {
        aperture: aperture,
        slug: slugify(aperture),
        number: number,
      };
      apertures.push(newAperture);
    }

    apertures = apertures.sort(
      (a, b) => parseFloat(a.aperture) - parseFloat(b.aperture)
    );

    return apertures;
  },
};
