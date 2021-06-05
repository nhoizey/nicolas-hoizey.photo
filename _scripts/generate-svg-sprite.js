const svgstore = require('svgstore');
const fs = require('fs');
const path = require('path');

// Where are Feather icons available from the npm package?
const ICONS_FOLDERS = {
  feather: 'node_modules/feather-icons/dist/icons/',
  majesticons: 'node_modules/majesticons/icons/',
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
    article: { name: 'blog' },
    calendar: { name: 'date' },
    camera: {},
    community: { name: 'urban' },
    'flower-2': { name: 'nature' },
    folder: {},
    'globe-earth': { name: 'travel' },
    heart: { name: 'like' },
    home: {},
    'info-circle': { name: 'info' },
    mail: { name: 'contact' },
    'map-simple-marker': { name: 'location' },
    incognito: { name: 'people' },
    watch: { name: 'exposition' },
  },
  simple: {
    flickr: {},
    unsplash: {},
  },
  local: {
    iso: {},
    // older: { title: 'Older' },
    // newer: { title: 'Newer' },
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
  stroke: #835aac;
  stroke-width: 2px;
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

console.log(`Here's the list of classes to add to your CSS:

${cssClassesString}

For example with Sass:

.icon {
  padding-left: 1.2em;

  background-size: 1em 1em;
  background-position: left center;
  background-repeat: no-repeat;

}

$iconNames: ${cssClassesString};

@each $icon in $iconNames {
  .icon--#{$icon} {
    background-image: url('/ui/svg-sprite.svg##{$icon}');
  }
}`);
