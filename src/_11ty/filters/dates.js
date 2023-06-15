// Luxon is already an Eleventy dependency anyway
const { DateTime } = require('luxon');

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

module.exports = {
  // 14 October 1983
  readableDate: (date) => dateObj(date).toLocaleString(DateTime.DATE_FULL),
  // 14 October 1983
  readableDateTime: (date) =>
    dateObj(date).toLocaleString(DateTime.DATETIME_FULL),
  // 1983-10-14
  attributeDate: (date) => dateObj(date).toISODate(),
  // 1983-10-14T20:04:00.000Z
  isoDate: (date) => dateObj(date).toUTC().toISO(),
  readableDateFromIso: (date) =>
    DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_FULL),
};
