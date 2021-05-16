module.exports = {
  photos_here: (collection, url) => {
    return collection.filter((page) => {
      const r = new RegExp(`^${url}[^/]+\/$`);
      return page.data.photo !== undefined && r.test(page.url);
    });
  },
  photos_bellow: (collection, url) => {
    // Inspired by @tylersticka
    // https://github.com/11ty/eleventy/issues/399#issuecomment-466514166
    return collection.filter((page) => {
      const r = new RegExp(`^${url}[^/]+\/([^/]+\/)+$`);
      return page.data.photo !== undefined && r.test(page.url);
    });
  },
  subgalleries: (collection, url) => {
    const sub = collection.filter((page) => {
      const r = new RegExp(`^${url}[^/]+\/$`);
      return page.data.photo === undefined && r.test(page.url);
    });
    return sub;
  },
};
