const svgstore = require('svgstore');
const fs = require('fs');
const path = require('path');

// Where are Feather icons available from the npm package?
const ICONS_FOLDERS = {
  feather: 'node_modules/feather-icons/dist/icons/',
  simple: 'node_modules/simple-icons/icons/',
  local: 'assets/svg/',
};

// Which icons do I need for the sprite?
// icon filename + title for accessibility
const ICONS_LIST = {
  feather: {
    aperture: {},
    calendar: { name: 'date' },
    camera: {},
    download: {},
    'file-text': { name: 'blog' },
    folder: {},
    globe: { name: 'travel' },
    home: {},
    inbox: { name: 'contact' },
    info: {},
    map: { name: 'location' },
    rss: { name: 'feeds' },
    star: { name: 'favorite' },
    twitter: {},
    users: { name: 'people' },
    watch: { name: 'exposition' },
  },
  simple: {
    flickr: {},
    unsplash: {},
  },
  local: {
    // older: { title: 'Older' },
    // newer: { title: 'Newer' },
  },
};

// Initiate the sprite with svgstore
let sprite = svgstore({
  // Add these attributes to the sprite SVG
  svgAttrs: { width: '24', height: '24', viewBox: '0 0 24 24' },
});

let cssClasses = [];

// Loop through each icon in the list
Object.entries(ICONS_LIST).forEach(([source, icons]) => {
  Object.entries(icons).forEach(([icon, properties]) => {
    // Load the content of the icon SVG file
    const svgFile = fs.readFileSync(path.join(ICONS_FOLDERS[source], `${icon}.svg`), 'utf8');
    const name = properties.name || icon;

    // Add the icon name to the CSS classes list
    cssClasses.push(name);

    // Log the name of the icon and its title to the console
    console.log(`${icon}.svg
-> #${name}
`);

    // Add the new symbol to the sprite
    sprite.add(name, svgFile, {
      cleanDefs: [
        'width',
        'height',
        'fill',
        'stroke',
        'stroke-width',
        'stroke-linecap',
        'stroke-linejoin',
        'class',
      ],
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
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
}
`;

const spriteString = sprite.toString({ inline: false }).replaceAll('<symbol ', '<g ').replaceAll('</symbol>', '</g>').replace('<defs/>', `<defs><style>${styles}</style></defs>`);

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