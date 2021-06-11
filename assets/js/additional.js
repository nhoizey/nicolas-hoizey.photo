import res from 'res';
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';

(function (window) {
  // get device pixel ratio in dppx
  let screen_density = res.dppx();

  // get viewport width
  // http://stackoverflow.com/a/8876069/717195
  let viewport_width = Math.max(
    window.document.documentElement.clientWidth,
    window.innerWidth || 0
  );

  // Load Mapbox map if necessary
  // const mapElementId = 'map';
  // const mapElement = window.document.querySelector(`#${mapElementId}`);
  // const mapLatitude = mapElement.dataset.latitude;
  // const mapLongitude = mapElement.dataset.longitude;

  // if (mapElement) {
  //   mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  //   let map = new mapboxgl.Map({
  //     container: mapElementId,
  //     style: 'mapbox://styles/mapbox/dark-v10',
  //     center: [mapLongitude, mapLatitude],
  //     zoom: 10,
  //   });
  // }
})(window);
