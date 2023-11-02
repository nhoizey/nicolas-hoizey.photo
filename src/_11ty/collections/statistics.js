const fs = require('fs');
const slugify = require('../_utils/slugify');

const usedPhotosGlob = 'src/galleries/**/*.md';

let statistics = undefined;

const getStatistics = (collection) => {
  if (statistics !== undefined) {
    return statistics;
  }

  statistics = {};
  statisticsObject = {};
  const photoSlugs = [];

  collection
    .getFilteredByGlob(usedPhotosGlob)
    .filter((item) => !item.filePathStem.endsWith('/index'))
    .forEach(function (item) {
      const photoData = item.data.origin.data;
      if (!photoSlugs.includes(item.page.fileSlug)) {
        // Don't count multiple times the same photo in multiple folders
        photoSlugs.push(item.page.fileSlug);

        ['aperture', 'shutter_speed', 'iso', 'focal_length_35mm'].forEach(
          (setting) => {
            if (statisticsObject[setting] === undefined) {
              statisticsObject[setting] = {};
            }
            if (
              photoData.settings !== undefined &&
              photoData.settings[setting] !== undefined
            ) {
              if (
                statisticsObject[setting][photoData.settings[setting]] !==
                undefined
              ) {
                statisticsObject[setting][photoData.settings[setting]]++;
              } else {
                statisticsObject[setting][photoData.settings[setting]] = 1;
              }
            }
          }
        );
      }
    });

  const prefixes = {
    aperture: 'ƒ/',
    shutter_speed: '',
    iso: '',
    focal_length_35mm: '',
  };

  const suffixes = {
    aperture: '',
    shutter_speed: ' s',
    iso: '',
    focal_length_35mm: ' mm',
  };

  ['aperture', 'shutter_speed', 'iso', 'focal_length_35mm'].forEach(
    (setting) => {
      statistics[setting] = [];
      for (const [value, number] of Object.entries(statisticsObject[setting])) {
        const readableValue = `${prefixes[setting]}${value}${suffixes[setting]}`;
        let newSettingObject;

        let computedValue = value;
        if (setting === 'shutter_speed' && value.match(/ /)) {
          // Deal with shutter speed value "1 1/2"
          computedValue = value.replace(' ', '+');
        }
        computedValue = eval(computedValue);

        try {
          newSettingObject = {
            raw_value: value,
            computed_value: computedValue,
            readable_value: readableValue,
            slug: slugify(readableValue),
            number: number,
          };
        } catch (e) {
          console.log(e);
          console.log(value);
        } finally {
          statistics[setting].push(newSettingObject);
        }
      }

      statistics[setting] = statistics[setting].sort(
        (a, b) => parseFloat(a.computed_value) - parseFloat(b.computed_value)
      );
    }
  );

  return statistics;
};

module.exports = {
  apertures: (collection) => getStatistics(collection).aperture,
  shutter_speeds: (collection) => getStatistics(collection).shutter_speed,
  isos: (collection) => getStatistics(collection).iso,
  focal_lengths: (collection) => getStatistics(collection).focal_length_35mm,
};
