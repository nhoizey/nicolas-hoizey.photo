// Inspired by @tylersticka
// https://github.com/11ty/eleventy/issues/399#issuecomment-466514166

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getMinFocalLength = (lense) => {
  let minFocalLength = lense.model.replace(/^[^0-9]*([0-9.]+)[-m×].*$/, '$1');
  return parseInt(minFocalLength, 10);
};

module.exports = {
  findBySlug: (collection, slug) => {
    const items = collection.filter((item) => item.page.fileSlug === slug);
    if (items.length === 1) {
      return items[0];
    } else {
      console.error(`Can't find content with slug "${slug}"`);
      return false;
    }
  },
  taggued: (collection, tag) => {
    const slugs = [];
    return collection.filter((item) => {
      if (slugs.includes(item.page.fileSlug)) {
        return false;
      } else {
        slugs.push(item.page.fileSlug);
        return item.data.origin.data.tags?.includes(tag);
      }
    });
  },
  shot_with: (photosCollection, gear) => {
    const slugs = [];
    const collectionWithGear = photosCollection.filter((item) => {
      if (slugs.includes(item.page.fileSlug)) {
        return false;
      } else {
        slugs.push(item.page.fileSlug);
        pageGear = item.data.origin.data.gear;
        if (`${pageGear?.camera?.brand} ${pageGear?.camera?.model}` === gear) {
          return true;
        }
        if (pageGear?.lenses !== undefined) {
          if (gear === 'Fujifilm Fujinon XF 27 mm f/2.8') {
            console.dir(pageGear.lenses);
          }
          let lenseFound = false;
          pageGear.lenses.forEach((data, lense) => {
            if (`${data.brand} ${data.model}` === gear) {
              lenseFound = true;
            }
          });
          return lenseFound;
        }
      }
      return false;
    });
    if (gear === 'Fujifilm Fujinon XF 27 mm f/2.8') {
      console.dir(collectionWithGear);
    }
    return collectionWithGear;
  },
  cameras: (collection, brand) =>
    collection.filter((gear) => gear.type === 'camera' && gear.brand === brand),
  lenses: (collection, brand) =>
    collection
      .filter((gear) => gear.type === 'lense' && gear.brand === brand)
      .sort((a, b) => getMinFocalLength(a) - getMinFocalLength(b)),
  photos_here: (collection, url) =>
    collection.filter((item) => {
      const r = new RegExp(`^${url}[^/]+\/$`);
      return r.test(item.page.url);
    }),
  photos_below: (collection, url) =>
    collection.filter((item) => {
      const r = new RegExp(`^${url}[^/]+\/([^/]+\/)+$`);
      return r.test(item.page.url);
    }),
  photos_here_and_below: (collection, url) => {
    const distinctPhotos = [];
    return collection
      .filter((item) => {
        const r = new RegExp(`^${url}[^/]+\/`);
        return r.test(item.page.url);
      })
      .filter((item) => {
        if (distinctPhotos.includes(item.page.fileSlug)) {
          return false;
        } else {
          distinctPhotos.push(item.page.fileSlug);
          return true;
        }
      });
  },
  featured: (collection, number) => {
    const allFeatured = collection.filter((item) => item.data.featured);
    // const featured = shuffle(allFeatured).slice(0, number);
    const featured = allFeatured.slice(0, number);
    if (featured.length < number) {
      const allNotFeatured = collection.filter((item) => !item.data.featured);
      const notFeatured = shuffle(allNotFeatured).slice(
        0,
        number - featured.length
      );
      return [...featured, ...notFeatured];
    }
    return featured;
  },
  not_featured: (collection) =>
    collection.filter((item) => !item.data.featured),
  sub_galleries: (collection, url) =>
    collection.filter((item) => {
      const r = new RegExp(`^${url}[^/]+\/$`);
      return r.test(item.page.url);
    }),
  breadcrumb: (collection, url) => {
    return collection
      .filter((item) => {
        const r = new RegExp(`^${item.page.url}[^/]+\/`);
        return item.page.url !== '/' && r.test(url);
      })
      .sort((a, b) => {
        return a.url.length - b.url.length;
      });
  },
};
