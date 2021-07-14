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
      center: [10, 20],
      zoom: 1,
      scrollZoom: false,
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

    map.on('load', function () {
      map.addSource('photos', {
        type: 'geojson',
        data: '/photos.geojson',
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'photos',
        filter: ['has', 'point_count'],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#53297c',
            5,
            '#3f205f',
            15,
            '#2c1642',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 10, 5, 15, 15, 20],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#2c1642',
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'photos',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'photos',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#663399',
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#2c1642',
        },
      });
    });
  }
})(window);
