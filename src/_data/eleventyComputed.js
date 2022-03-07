const pkg = require('../../package.json');

module.exports = {
  opengraph: {
    type: (data) => (data.page.url === '/' ? 'website' : 'article'),
    title: (data) => data.title,
    image: {
      title: (data) => {
        return data.page.url === '/' ? pkg.title : data.title;
      },
      tagline: (data) => 'blop',
    },
  },
};
