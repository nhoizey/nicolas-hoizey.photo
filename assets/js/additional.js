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
})(window);

function sendToMatomo({ name, value }) {
  console.dir({ name, value });

  if ('_paq' in window) console.log('ok');

  switch (name) {
    case 'LCP':
      // _paq.push(['setCustomVariable', 1, 'LCP', Math.round(value), 'page']);
      break;
    case 'CLS':
      // _paq.push(['setCustomVariable', 2, 'CLS', Math.round(value * 1000), 'page']);
      break;
  }
}

getCLS(sendToMatomo);
getLCP(sendToMatomo);
