import res from 'res';
import { getLCP, getCLS } from 'web-vitals/base';

(function (window) {
  // get device pixel ratio in dppx
  let screen_density = res.dppx();
  // _paq.push([
  //   'setCustomDimension',
  //   3,
  //   'screen_density',
  //   screen_density,
  //   'page',
  // ]);
  _paq.push(['trackPageView', document.title, { dimension3: screen_density }]);

  // get viewport width
  // http://stackoverflow.com/a/8876069/717195
  let viewport_width = Math.max(
    window.document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  _paq.push([
    'setCustomDimension',
    4,
    'viewport_width',
    viewport_width,
    'page',
  ]);
})(window);

function sendToMatomo({ name, value }) {
  console.dir({ name, value });

  if ('_paq' in window) {
    // Matomo is available
    switch (name) {
      case 'LCP':
        _paq.push(['setCustomDimension', 1, 'LCP', Math.round(value), 'page']);
        break;
      case 'CLS':
        _paq.push([
          'setCustomDimension',
          2,
          'CLS',
          Math.round(value * 1000),
          'page',
        ]);
        break;
    }
  }
}

getCLS(sendToMatomo);
getLCP(sendToMatomo);
