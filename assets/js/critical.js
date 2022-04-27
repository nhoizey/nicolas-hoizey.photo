(function (window) {
  // get device pixel ratio in dppx
  window.screen_density = window.devicePixelRatio || 0;

  // get viewport width
  // http://stackoverflow.com/a/8876069/717195
  window.viewport_width = Math.max(
    window.document.documentElement.clientWidth,
    window.innerWidth || 0
  );
})(window);
