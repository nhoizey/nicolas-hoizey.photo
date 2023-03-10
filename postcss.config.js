module.exports = {
  plugins: [
    require('postcss-logical')({ dir: 'ltr' }),
    require('autoprefixer'),
    require('postcss-fail-on-warn'),
  ],
};
