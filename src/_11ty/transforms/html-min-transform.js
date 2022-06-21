const htmlmin = require('html-minifier');

module.exports = function htmlMinTransform(content, outputPath) {
  if (!outputPath || !(outputPath.endsWith('.html'))) {
    return content;
  }
  if (outputPath.match(/\/photos\//)) {
    console.log(outputPath);
  }

  return htmlmin.minify(content, {
    useShortDoctype: true,
    removeComments: true,
    collapseWhitespace: true,
    minifyCSS: false,
  });
};
