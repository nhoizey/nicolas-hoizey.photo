const fs = require('fs');
const path = require('path');

const FLAGS_FOLDER = 'node_modules/svg-country-flags/svg/';

module.exports = {
  flagSvg: (countryCode) => {
    const svgFile = path.join(FLAGS_FOLDER, `${countryCode}.svg`);
    if (!fs.existsSync(svgFile)) {
      return '';
    } else {
      let svg = fs.readFileSync(svgFile, 'utf8');
      svg = svg.replace('<svg ', '<svg class="flag" ');
      return svg;
    }
  },
};
