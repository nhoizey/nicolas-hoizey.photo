const fs = require('fs');
const slugify = require('../_utils/slugify');

const usedPhotosGlob = 'src/galleries/**/*.md';

const settingsList = ['aperture', 'shutter_speed', 'iso', 'focal_length'];

let statistics = undefined;

const getStatistics = (collection) => {
  if (statistics !== undefined) {
    return statistics;
  }

  statistics = {};
  statisticsObject = {};
  const photoSlugs = [];

  settingsValues = {};
  settingsList.forEach((setting) => {
    settingsValues[setting] = {};
  });

  collection
    .getFilteredByGlob(usedPhotosGlob)
    .filter((item) => !item.filePathStem.endsWith('/index'))
    .forEach(function (item) {
      const photoData = item.data.origin.data;
      if (!photoSlugs.includes(item.page.fileSlug)) {
        // Don't count multiple times the same photo in multiple folders
        photoSlugs.push(item.page.fileSlug);

        settingsList.forEach((setting) => {
          if (statisticsObject[setting] === undefined) {
            statisticsObject[setting] = {};
          }
          if (
            photoData.settings !== undefined &&
            photoData.settings[setting] !== undefined &&
            photoData.settings[setting].readable !== undefined
          ) {
            // Keep a list of all possible values for each setting, based on raw reference
            if (
              settingsValues[setting][photoData.settings[setting].readable] ===
              undefined
            ) {
              settingsValues[setting][photoData.settings[setting].readable] =
                photoData.settings[setting];
            }

            // Count the number of photos for each setting value
            if (
              statisticsObject[setting][
                photoData.settings[setting].readable
              ] !== undefined
            ) {
              statisticsObject[setting][photoData.settings[setting].readable]++;
            } else {
              statisticsObject[setting][
                photoData.settings[setting].readable
              ] = 1;
            }
          }
        });
      }
    });

  settingsList.forEach((setting) => {
    statistics[setting] = [];
    for (const [value, number] of Object.entries(statisticsObject[setting])) {
      let newSettingObject;

      newSettingObject = settingsValues[setting][value];
      newSettingObject.number = number;
      statistics[setting].push(newSettingObject);
    }

    statistics[setting] = statistics[setting].sort(
      (a, b) => parseFloat(a.computed) - parseFloat(b.computed)
    );
  });

  return statistics;
};

module.exports = {
  apertures: (collection) => getStatistics(collection).aperture,
  shutter_speeds: (collection) => getStatistics(collection).shutter_speed,
  isos: (collection) => getStatistics(collection).iso,
  focal_lengths: (collection) => getStatistics(collection).focal_length,
};
