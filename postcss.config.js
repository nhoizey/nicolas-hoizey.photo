module.exports = {
  plugins: [
    require('postcss-logical')({ dir: 'ltr' }),
    require('postcss-ignore-transition-properties'),
    require('autoprefixer'),
    require('postcss-fail-on-warn'),
  ],
};
