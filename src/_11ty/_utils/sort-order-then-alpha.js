// Sort items with `order` before others
module.exports = (a, b) => {
  if (a.data.nav && a.data.nav.order) {
    if (b.data.nav && b.data.nav.order) {
      return parseInt(a.data.nav.order, 10) - parseInt(b.data.nav.order, 10);
    } else {
      return -1;
    }
  } else {
    if (b.data.nav && b.data.nav.order) {
      return 1;
    } else {
      return a.data.title.localeCompare(b.data.title, 'en', {
        ignorePunctuation: true,
        sensitivity: 'base',
      });
    }
  }
};
