import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';

(function (window) {
  // Load Mapbox map if necessary
  const mapElementId = 'map';
  const mapElement = window.document.querySelector(`#${mapElementId}`);

  if (mapElement) {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    let map = new mapboxgl.Map({
      container: mapElementId,
      // style: 'mapbox://styles/nhoizey/cjese953v0peh2spcgq64caff',
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
      hash: true,
      renderWorldCopies: true,
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );
    map.addControl(new mapboxgl.FullscreenControl());
  }
})(window);
