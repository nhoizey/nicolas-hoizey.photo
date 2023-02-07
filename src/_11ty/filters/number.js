module.exports = {
  rough: (number) => {
    if (number < 20) {
      return `${number}`;
    }
    return `${10 * Math.floor(number / 10)}+`;
  },
};
