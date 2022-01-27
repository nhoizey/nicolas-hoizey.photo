import res from 'res';
import { getLCP, getCLS } from 'web-vitals/base';

(function (window) {
  // get device pixel ratio in dppx
  let screen_density = res.dppx();

  // get viewport width
  // http://stackoverflow.com/a/8876069/717195
  let viewport_width = Math.max(
    window.document.documentElement.clientWidth,
    window.innerWidth || 0
  );

  // send custom dimensions to Matomo
  _paq.push([
    'trackPageView',
    document.title,
    { dimension3: screen_density, dimension4: viewport_width },
  ]);
})(window);

function sendToMatomo({ name, value }) {
  if ('_paq' in window) {
    // Matomo is available
    switch (name) {
      case 'LCP':
        // send custom dimensions to Matomo
        _paq.push([
          'trackPageView',
          document.title,
          { dimension1: Math.round(value) },
        ]);
        break;
      case 'CLS':
        // send custom dimensions to Matomo
        _paq.push([
          'trackPageView',
          document.title,
          { dimension2: Math.round(value * 1000) },
        ]);
        break;
    }
  }
}

getCLS(sendToMatomo);
getLCP(sendToMatomo);
