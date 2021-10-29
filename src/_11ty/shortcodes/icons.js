const fs = require('fs');
const path = require('path');

const ICONS_FOLDERS = {
  feather: 'node_modules/feather-icons/dist/icons/',
  majesticons: 'node_modules/majesticons/line/',
  simple: 'node_modules/simple-icons/icons/',
  local: 'assets/svg/',
};

const ICONS = {
  blog: { name: 'article-line', source: 'majesticons' },
  date: { name: 'calendar-line', source: 'majesticons' },
  camera: { name: 'camera-line', source: 'majesticons' },
  urban: { name: 'community-line', source: 'majesticons' },
  nature: { name: 'flower-2-line', source: 'majesticons' },
  folder: { name: 'folder-line', source: 'majesticons' },
  travels: { name: 'globe-earth-2-line', source: 'majesticons' },
  like: { name: 'heart-line', source: 'majesticons' },
  home: { name: 'home-line', source: 'majesticons' },
  portraits: { name: 'incognito-line', source: 'majesticons' },
  info: { name: 'info-circle-line', source: 'majesticons' },
  contact: { name: 'mail-line', source: 'majesticons' },
  map: { name: 'map-simple-marker-line', source: 'majesticons' },
  misc: { name: 'puzzle-line', source: 'majesticons' },
  share: { name: 'share-line', source: 'majesticons' },
  tag: { name: 'tag-line', source: 'majesticons' },
  share: { name: 'share-line', source: 'majesticons' },
  focal_length: { name: 'telescope-line', source: 'majesticons' },
  shutter_speed: { name: 'timer-line', source: 'majesticons' },
  aperture: { name: 'aperture', source: 'feather' },
  download: { name: 'download', source: 'feather' },
  feeds: { name: 'rss', source: 'feather' },
  twitter: { name: 'twitter', source: 'feather' },
  eleventy: { name: 'eleventy', source: 'simple' },
  flickr: { name: 'flickr', source: 'simple' },
  unsplash: { name: 'unsplash', source: 'simple' },
  iso: { name: 'iso', source: 'local' },
};

module.exports = {
  icon: (icon) => {
    const { name, source } = ICONS[icon];
    let svg = fs.readFileSync(
      path.join(ICONS_FOLDERS[source], `${name}.svg`),
      'utf8'
    );
    svg = svg.replace(
      'viewBox="0 0 24 24"',
      'viewBox="0 0 24 24" width="1.2em" height="1.2em"'
    );
    svg = svg.replace('width="24" height="24"', '');
    svg = svg.replaceAll(/fill="[^"]+"/g, '');
    svg = svg.replaceAll(/stroke="[^"]+"/g, '');
    svg = svg.replaceAll(/stroke-width="[^"]+"/g, '');
    svg = svg.replaceAll(/stroke-linecap="[^"]+"/g, '');
    svg = svg.replaceAll(/stroke-linejoin="[^"]+"/g, '');
    svg = svg.replaceAll(/class="[^"]+"/g, '');
    return svg;
  },
};
