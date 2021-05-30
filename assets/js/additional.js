const res = require('res');

(function (window) {
  // get device pixel ratio in dppx
  let screen_density = res.dppx();

  // get viewport width
  // http://stackoverflow.com/a/8876069/717195
  let viewport_width = Math.max(
    window.document.documentElement.clientWidth,
    window.innerWidth || 0
  );
})(window);
