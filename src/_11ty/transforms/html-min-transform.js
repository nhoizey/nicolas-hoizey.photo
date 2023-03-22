module.exports = function htmlMinTransform(content) {
  if (!this.page.outputPath || !this.page.outputPath.endsWith('.html')) {
    // console.log(`WARNING: Transform run on ${this.page.outputPath}`);
    // if (this.page.outputPath === false) {
    //   console.dir(content);
    // }
    return content;
  }

  // if (this.page.outputPath.match(/\/photos\//)) {
  //   console.log(this.page.outputPath);
  // }

  const { minify } = require('html-minifier-terser');

  return minify(content, {
    useShortDoctype: true,
    removeComments: true,
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    minifyCSS: false,
  });
};
