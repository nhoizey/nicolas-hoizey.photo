(function (window) {
  // Add a class if Container Queries are supported
  // Inspired by https://supportscss.dev/
  if (window.CSSContainerRule) {
    window.document.documentElement.classList.add('supports-at-container');
  }

  // Style for Mapbox
  window.mapboxStyle = 'mapbox/outdoors-v11';

  // get device pixel ratio in dppx
  window.screen_density = window.devicePixelRatio || 0;

  // get viewport width
  // http://stackoverflow.com/a/8876069/717195
  window.viewport_width = Math.max(
    window.document.documentElement.clientWidth,
    window.innerWidth || 0
  );

  if (process.env.NODE_ENV === 'production') {
    // Prepare Matomo data
    var _paq = (window._paq = window._paq || []);

    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['setCustomDimension', 3, window.screen_density]);
    _paq.push(['setCustomDimension', 4, window.viewport_width]);

    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    var u = 'https://data.nicolas-hoizey.com/';
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', '11']);
  }
})(window);
