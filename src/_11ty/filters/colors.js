const componentToHex = (c) => {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};

const rgbToHex = (r, g, b) => {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
};

module.exports = {
  rgb2hex: (rgbString, photo = '') => {
    if (rgbString === undefined) {
      console.log(`No colors for ${photo}`);
      return '999999';
    }
    let rgbArray = rgbString.split(' ').map((c) => parseInt(c, 10));
    let rgbHex = rgbToHex(rgbArray);
    console.log(rgbHex);
    return rgbHex;
  },
};
