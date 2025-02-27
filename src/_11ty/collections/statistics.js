import { getUniquePhotos } from "../_utils/photoCollections.js";

const settingsList = ["aperture", "shutter_speed", "iso", "focal_length"];

let statisticsList = undefined;
const getStatistics = (collection) => {
	if (statisticsList !== undefined) {
		return statisticsList;
	}

	statisticsList = {};
	const statisticsObject = {};

	const settingsValues = {};
	for (const setting of settingsList) {
		settingsValues[setting] = {};
	}

	for (const item of getUniquePhotos(collection)) {
		const photoData = item.data.origin.data;

		for (const setting of settingsList) {
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
					statisticsObject[setting][photoData.settings[setting].readable] !==
					undefined
				) {
					statisticsObject[setting][photoData.settings[setting].readable]++;
				} else {
					statisticsObject[setting][photoData.settings[setting].readable] = 1;
				}
			}
		}
	}

	for (const setting of settingsList) {
		statisticsList[setting] = [];
		for (const [value, number] of Object.entries(statisticsObject[setting])) {
			const newSettingObject = settingsValues[setting][value];
			newSettingObject.number = number;
			statisticsList[setting].push(newSettingObject);
		}

		statisticsList[setting] = statisticsList[setting].sort(
			(a, b) => Number.parseFloat(a.computed) - Number.parseFloat(b.computed),
		);
	}

	return statisticsList;
};

export const apertures = (collection) => getStatistics(collection).aperture;

export const shutter_speeds = (collection) =>
	getStatistics(collection).shutter_speed;

export const isos = (collection) => getStatistics(collection).iso;

export const focal_lengths = (collection) =>
	getStatistics(collection).focal_length;
