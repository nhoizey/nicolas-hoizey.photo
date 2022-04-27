import { getLCP, getCLS } from 'web-vitals/base';

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
