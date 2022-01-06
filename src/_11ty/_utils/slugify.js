const slugify = require('@sindresorhus/slugify');

// slugify is called 1000s of times, let's memoize it
let memoizedSlugs = {};

module.exports = (string) => {
  if (string in memoizedSlugs) {
    return memoizedSlugs[string];
  } else {
    const tifinaghRegex = /^[ \u{2D30}-\u{2D7F}]+$/u;
    let slug = string;
    if (tifinaghRegex.test(slug)) {
      slug = slug.replace(/ +/, '-');
    } else {
      slug = slugify(string, {
        decamelize: false,
        customReplacements: [
          ['%', ' '],
          ['…', ' '],
        ],
      });
    }
    memoizedSlugs[string] = slug;
    return slug;
  }
};
