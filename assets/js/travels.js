import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import polylabel from 'polylabel';

(function (window) {
  // Load Mapbox map if necessary
  const mapElementId = 'map';
  const mapElement = window.document.querySelector(`#${mapElementId}`);
  const maxZoomLevel = 18;
  const clusterSteps = [5, 10];

  if (mapElement) {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    let map = new mapboxgl.Map({
      container: mapElementId,
      // style: 'mapbox://styles/nhoizey/cjese953v0peh2spcgq64caff',
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [10, 20],
      zoom: 1,
      minZoom: 1,
      maxZoom: maxZoomLevel,
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
        clusterMaxZoom: maxZoomLevel,
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
          //   * #53297c 10px circles when point count is less than steps[0]
          //   * #3f205f 15px circles when point count is between steps[0] and steps[1]
          //   * #2c1642 20px circles when point count is greater than or equal to steps[1]
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#53297c',
            clusterSteps[0],
            '#3f205f',
            clusterSteps[1],
            '#2c1642',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            8,
            clusterSteps[0],
            11,
            clusterSteps[1],
            14,
          ],
          'circle-stroke-width': 2,
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
          'text-size': 10,
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
          'circle-stroke-width': 2,
          'circle-stroke-color': '#2c1642',
        },
      });

      map.on('click', 'clusters', function (e) {
        let features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        let clusterId = features[0].properties.cluster_id;

        let coordinates = features[0].geometry.coordinates.slice();
        let point_count = features[0].properties.point_count;
        map
          .getSource('photos')
          .getClusterLeaves(
            clusterId,
            point_count,
            0,
            function (err, clusterFeatures) {
              if (map.getZoom() === maxZoomLevel) {
                // Show photos from cluster
                var popupString = '';
                var childrenCount = Object.keys(clusterFeatures).length;
                clusterFeatures.forEach((feature) => {
                  let imageProperties = feature.properties;
                  popupString += `<p><a href="${imageProperties.url}"><img src="${imageProperties.image}" width="${imageProperties.width}" height="${imageProperties.height}" alt="">${imageProperties.title}</a></p>`;
                });
                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(
                    `<div class="mapboxgl-popup-photos"><p>${childrenCount} photos:</p>${popupString}</div>`
                  )
                  .addTo(map);
              } else {
                // Zoom in cluster
                let clusterMarkers = [];
                clusterFeatures.forEach((feature) => {
                  clusterMarkers.push(feature.geometry.coordinates);
                });
                map
                  .getSource('photos')
                  .getClusterExpansionZoom(clusterId, function (err, zoom) {
                    if (err) return;

                    map.flyTo({
                      center: polylabel([clusterMarkers]),
                      zoom: zoom,
                      speed: 0.5,
                    });
                  });
              }
            }
          );
      });

      map.on('click', 'unclustered-point', function (e) {
        let coordinates = e.features[0].geometry.coordinates.slice();
        let imageProperties = e.features[0].properties;

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup({ className: 'map-popup' })
          .setLngLat(coordinates)
          .setHTML(
            `<a href="${imageProperties.url}"><img src="${imageProperties.image}" width="${imageProperties.width}" height="${imageProperties.height}" alt="">${imageProperties.title}</a>`
          )
          .addTo(map);
      });

      map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = '';
      });
    });
  }
})(window);
