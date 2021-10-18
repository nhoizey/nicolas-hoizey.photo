const svgstore = require('svgstore');
const fs = require('fs');
const path = require('path');

// Where are Feather icons available from the npm package?
const ICONS_FOLDERS = {
  feather: 'node_modules/feather-icons/dist/icons/',
  majesticons: 'node_modules/majesticons/line/',
  simple: 'node_modules/simple-icons/icons/',
  local: 'assets/svg/',
};

// Which icons do I need for the sprite?
// icon filename + title for accessibility
const ICONS_LIST = {
  feather: {
    aperture: {},
    download: {},
    rss: { name: 'feeds' },
    twitter: {},
  },
  majesticons: {
    'article-line': { name: 'blog' },
    'calendar-line': { name: 'date' },
    'camera-line': { name: 'camera' },
    'community-line': { name: 'urban' },
    'flower-2-line': { name: 'nature' },
    'folder-line': { name: 'folder' },
    'globe-earth-2-line': { name: 'travels' },
    'heart-line': { name: 'like' },
    'home-line': { name: 'home' },
    'incognito-line': { name: 'portraits' },
    'info-circle-line': { name: 'info' },
    'mail-line': { name: 'contact' },
    'map-simple-marker-line': { name: 'map' },
    'puzzle-line': { name: 'misc' },
    'share-line': { name: 'share' },
    'tag-line': { name: 'tag' },
    'telescope-line': { name: 'focal_length' },
    'timer-line': { name: 'shutter_speed' },
  },
  simple: {
    eleventy: {},
    flickr: {},
    unsplash: {},
  },
  local: {
    iso: {},
  },
};

const attributesToClean = [
  'width',
  'height',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'class',
];

// Initiate the sprite with svgstore
let sprite = svgstore({
  // Add these attributes to the sprite SVG
  svgAttrs: {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    vectorEffect: 'non-scaling-stroke',
  },
});

let cssClasses = [];

// Loop through each icon in the list
Object.entries(ICONS_LIST).forEach(([source, icons]) => {
  Object.entries(icons).forEach(([icon, properties]) => {
    // Load the content of the icon SVG file
    const svgFile = fs.readFileSync(
      path.join(ICONS_FOLDERS[source], `${icon}.svg`),
      'utf8'
    );
    const name = properties.name || icon;

    // Add the icon name to the CSS classes list
    cssClasses.push(name);

    // Log the name of the icon and its title to the console
    console.log(`${icon}.svg
-> #${name}
`);

    // Add the new symbol to the sprite
    sprite.add(name, svgFile, {
      cleanDefs: attributesToClean,
      cleanSymbols: attributesToClean,
    });
  });
});
const styles = `
g {
  display: none;
}
g:target {
  display: inline;
  fill: none;
  stroke: #a081c0;
  stroke-width: 1px;
  stroke-linecap: round;
  stroke-linejoin: round;
}
path {
  vector-effect: non-scaling-stroke;
}
`;

const spriteString = sprite
  .toString({ inline: false })
  .replaceAll('<symbol ', '<g ')
  .replaceAll('</symbol>', '</g>')
  .replace('<defs/>', `<defs><style>${styles}</style></defs>`);

const cssClassesString = cssClasses.join(',');

// Generate an external SVG
fs.writeFileSync('src/ui/svg-sprite.svg', spriteString);

// Generate the Sass file
const sass = `.icon {
  padding-left: 1.4em;

  background-size: 1.3em 1.3em;
  background-position-x: 0;
  background-position-y: 0.1em;
  background-repeat: no-repeat;
}

$iconNames: ${cssClassesString};

@each $icon in $iconNames {
  .icon--#{$icon} {
    background-image: url('/ui/svg-sprite.svg##{$icon}');
  }
}`;

fs.writeFileSync('assets/sass/_icons-sprite.scss', sass);
