const rgbString2Array = (rgbString) =>
  rgbString.split(' ').map((c) => parseInt(c, 10));

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

// Main background: #292929 = rgb(41, 41, 41)
module.exports = {
  bgcolor: (rgbString) =>
    rgbToHex(
      rgbString2Array(rgbString).map((c) => Math.round(c * 0.5 + 41 * 0.5))
    ),
  fgcolor: (rgbString) =>
    rgbToHex(
      rgbString2Array(rgbString).map((c) => Math.round(c * 0.5 + 255 * 0.5))
    ),
};
