const config = require('../../pack11ty.config.js');

module.exports = {
  opengraph: {
    type: (data) => (data.page.url === '/' ? 'website' : 'article'),
    title: (data) => data.title,
    image: {
      title: (data) => {
        console.dir(data);
        return data.page.url === '/' ? site.title : data.title;
      },
      tagline: (data) => 'blop',
    },
  },
};
