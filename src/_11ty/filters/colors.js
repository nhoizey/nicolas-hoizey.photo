const componentToHex = (c) => {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};

const rgbToHex = (rgbArray) => {
  return (
    componentToHex(rgbArray[0]) +
    componentToHex(rgbArray[1]) +
    componentToHex(rgbArray[2])
  );
};

module.exports = {
  rgb2hex: (rgbString) => {
    if (!rgbString?.match(/^[0-9.]+ [0-9.]+ [0-9.]+$/)) {
      return '292929';
    }
    let rgbArray = rgbString.split(' ').map((c) => parseInt(c, 10));
    let rgbHex = rgbToHex(rgbArray);
    return rgbHex;
  },
};
