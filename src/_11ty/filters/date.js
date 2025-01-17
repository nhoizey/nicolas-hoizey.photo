// Luxon is already an Eleventy dependency anyway
import { DateTime } from "luxon";

// TODO: allow setting the timezone and locale
const timezone = "Europe/Paris";
const locale = "en-GB";

const dateObj = (eleventyDate) => {
	if (eleventyDate === undefined) {
		return DateTime.now().setZone(timezone).setLocale(locale);
	}
	return DateTime.fromJSDate(eleventyDate, {
		zone: timezone,
	}).setLocale(locale);
};

// 1983
export const year = (date) => dateObj(date).toFormat("yyyy");
