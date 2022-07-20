module.exports = {
  plugins: [
    require('postcss-logical')({ dir: 'ltr', preserve: true }),
    require('autoprefixer'),
    require('cssnano'),
    require('postcss-fail-on-warn'),
  ],
};
