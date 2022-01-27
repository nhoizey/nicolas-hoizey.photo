const slugify = require('@sindresorhus/slugify');

const poorSlugify = (str) => {
  // Adapted from https://gist.github.com/codeguy/6684588#gistcomment-3361909
  let slug = str.toString();
  if (str === '天壇大佛') console.dir({ slug });
  slug = slug.replaceAll('/', ' ');
  if (str === '天壇大佛') console.dir({ slug });
  slug = slug.normalize('NFD');
  if (str === '天壇大佛') console.dir({ slug });
  slug = slug.replace(/[\u0300-\u036f]/g, '');
  if (str === '天壇大佛') console.dir({ slug });
  slug = slug.toLowerCase();
  if (str === '天壇大佛') console.dir({ slug });
  slug = slug.replace(/\s+/g, ' ');
  if (str === '天壇大佛') console.dir({ slug });
  slug = slug.trim();
  if (str === '天壇大佛') console.dir({ slug });
  slug = slug.replace(/ +/g, '-');
  if (str === '天壇大佛') console.dir({ slug });

  return slug;
};

// slugify is called 1000s of times, let's memoize it
let memoizedSlugs = {};

module.exports = (string) => {
  if (string in memoizedSlugs) {
    return memoizedSlugs[string];
  } else {
    const tifinaghRegex = /^[ \u{2D30}-\u{2D7F}]+$/u;
    // Chinese characters (except the extensions): https://stackoverflow.com/a/41155368/717195
    const chineseRegex =
      /^[ \u{2E80}-\u{2FD5}\u{3190}-\u{319f}\u{3400}-\u{4DBF}\u{4E00}-\u{9FCC}\u{F900}-\u{FAAD}]+$/u;
    let slug = string;
    if (tifinaghRegex.test(slug) || chineseRegex.test(slug)) {
      // slug = slug.replace(/ +/, '-');
      slug = poorSlugify(slug);
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
