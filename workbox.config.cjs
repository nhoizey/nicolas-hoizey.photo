const path = require('node:path');

const DIST = '_site';

module.exports = {
  globDirectory: DIST,
  globPatterns: [
    './bundle/*.',
    './manifest.webmanifest',
  ],
  dontCacheBustURLsMatching: /\.(css|js)$/,
  swSrc: path.join(DIST, 'service-worker.js'),
  swDest: path.join(DIST, 'service-worker.js'),
};
