module.exports = {
  rough: (number) => {
    if (number < 20) {
      return `${number}`;
    }
    const roughValue = 10 * Math.floor(number / 10);
    const formatedString = new Intl.NumberFormat('en-US').format(roughValue);
    return `${formatedString}+`;
  },
};
