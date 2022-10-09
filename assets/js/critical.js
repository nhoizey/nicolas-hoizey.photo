(function (window) {
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
    // Matomo
    var _paq = (window._paq = window._paq || []);
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['setCustomDimension', 3, window.screen_density]);
    _paq.push(['setCustomDimension', 4, window.viewport_width]);

    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function () {
      var u = 'https://data.nicolas-hoizey.com/';
      _paq.push(['setTrackerUrl', u + 'matomo.php']);
      _paq.push(['setSiteId', '11']);
      var d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.src = '/ui/js/matomo.js';
      g.crossorigin = 'anonymous';
      s.parentNode.insertBefore(g, s);
    })();
  }
})(window);
