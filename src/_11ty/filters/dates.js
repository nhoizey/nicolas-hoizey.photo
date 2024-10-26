// TODO: filtres à supprimer quand dispo dans eleventy-plugin-pack11ty

// Luxon is already an Eleventy dependency anyway
import { DateTime } from 'luxon';

// TODO: allow setting the timezone and locale
const timezone = 'Europe/Paris';
const locale = 'en-GB';

const dateObj = (eleventyDate) => {
	if (eleventyDate === undefined) {
		return DateTime.now().setZone(timezone).setLocale(locale);
	}
	return DateTime.fromJSDate(eleventyDate, {
		zone: timezone,
	}).setLocale(locale);
};

// 14 October 1983
export const readableDateTime = (date) =>
	dateObj(date).toLocaleString(DateTime.DATETIME_FULL);

export const readableDateFromIso = (date) =>
	DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_FULL);
