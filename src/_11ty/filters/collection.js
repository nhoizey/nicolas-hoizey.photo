module.exports = {
  photos_here: (collection, url) => {
    return collection.filter((page) => {
      const r = new RegExp(`^${url}[^/]+\/$`);
      return page.data.photo !== undefined && r.test(page.url);
    });
  },
  photos_bellow: (collection, url) => {
    return collection.filter((page) => {
      const r = new RegExp(`^${url}[^/]+\/([^/]+\/)+$`);
      return page.data.photo !== undefined && r.test(page.url);
    });
  },
  subgalleries: (collection, url) => {
    return collection.filter((page) => {
      const r = new RegExp(`^${url}[^/]+\/$`);
      return page.data.photo === undefined && r.test(page.url);
    });
  },
};
