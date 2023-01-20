module.exports = {
  plugins: [
    require('postcss-logical')({ dir: 'ltr' }),
    require('autoprefixer'),
    require('cssnano'),
    require('postcss-fail-on-warn'),
  ],
};
