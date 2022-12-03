const slugifyString = require('../_utils/slugify');

module.exports = {
  slugify: (string) => slugifyString(string),
  base64: (string) => {
    return Buffer.from(string).toString('base64');
  },
  clean4cloudinary: (string) =>
    string.replace(',', '%252C').replace('/', '%252F').replace('?', '%253F'),
  tagToHashtag: (tag) => {
    let hashtag = tag.toString();
    hashtag = hashtag.replaceAll('/', ' ');
    // Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    hashtag = hashtag.normalize('NFD');
    // Remove https://en.wikipedia.org/wiki/Combining_Diacritical_Marks
    hashtag = hashtag.replace(/[\u0300-\u036f]/g, '');

    hashtag = hashtag.replaceAll('&#39;', ' ');

    let words = hashtag.replaceAll(/[-\.]/g, ' ').split(' ');
    return (
      words[0] +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.substr(1))
        .join('')
    );
  },
};
