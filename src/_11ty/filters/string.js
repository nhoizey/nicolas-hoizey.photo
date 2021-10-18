const slugifyString = require('../_utils/slugify');

module.exports = {
  slugify: (string) => slugifyString(string),
  base64: (string) => {
    return Buffer.from(string).toString('base64');
  },
};
