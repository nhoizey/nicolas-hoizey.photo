const moment = require('moment');

module.exports = {
  date: (date, format) => moment(date).format(format),
  attributeDate: (date) => moment(date).format('YYYY-MM-DD'),
  iso: (date) => date.toISOString(),
};
