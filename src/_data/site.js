const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  title: 'Nicolas Hoizey photography',
  description: 'The photography portfolio of Nicolas Hoizey',
  url:
    process.env.NODE_ENV === 'production'
      ? 'https://nicolas-hoizey.photo'
      : 'http://localhost:8080',
  author: {
    name: 'Nicolas Hoizey',
    email: 'nicolas@hoizey.com',
    url: 'https://nicolas-hoizey.com',
    twitter: 'nhoizey',
    facebook: 'nhoizey',
  },
};
