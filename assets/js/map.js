import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import polylabel from 'polylabel';

(function (window) {
  // Load Mapbox map if necessary
  const mapElementId = 'map';
  const mapElement = window.document.querySelector(`#${mapElementId}`);
  const maxZoomLevel = 18;
  const clusterSteps = [
    { count: 5, color: '#835aac', radius: 8 },
    { count: 10, color: '#663399', radius: 10 },
    { count: 20, color: '#53297c', radius: 12 },
    { count: 100, color: '#53297c', radius: 15 },
  ];
  const markerStroke = '#ffffff';

  if (mapElement) {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    let map = new mapboxgl.Map({
      container: mapElementId,
      style: `${window.location.origin}/map/mapbox-style-terrain.json`,
      center: [10, 20],
      zoom: 1.5,
      bounds: [
        [-120, -65],
        [150, 80],
      ],
      minZoom: 1,
      maxZoom: maxZoomLevel,
      scrollZoom: false,
      attributionControl: false,
      hash: true,
      renderWorldCopies: true,
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    const addLayers = () => {
      if (!map.getSource('photos')) {
        map.addSource('photos', {
          type: 'geojson',
          data: '/map/photos.geojson',
          cluster: true,
          clusterMaxZoom: maxZoomLevel,
          clusterRadius: 30, // Radius of each cluster when clustering points (defaults to 50)
        });
      }

      if (!map.getLayer('clusters')) {
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'photos',
          filter: ['has', 'point_count'],
          paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            'circle-color': [
              'step',
              ['get', 'point_count'],
              clusterSteps[0].color,
              clusterSteps[0].count,
              clusterSteps[1].color,
              clusterSteps[1].count,
              clusterSteps[2].color,
              clusterSteps[2].count,
              clusterSteps[3].color,
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              clusterSteps[0].radius,
              clusterSteps[0].count,
              clusterSteps[1].radius,
              clusterSteps[1].count,
              clusterSteps[2].radius,
              clusterSteps[2].count,
              clusterSteps[3].radius,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': markerStroke,
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

        map.on('mouseenter', 'clusters', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', function () {
          map.getCanvas().style.cursor = '';
        });
      }

      if (!map.getLayer('cluster-count')) {
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
      }

      if (!map.getLayer('unclustered-point-photo')) {
        map.addLayer({
          id: 'unclustered-point-photo',
          type: 'symbol',
          source: 'photos',
          filter: ['!', ['has', 'point_count']],
          sprite: `SPRITE_URL_PREFIX${window.location.origin}/ui/thumbnails/sprite`,
          layout: {
            'icon-image': '{slug}',
            'icon-allow-overlap': true,
          },
        });

        map.on('click', 'unclustered-point-photo', function (e) {
          let coordinates = e.features[0].geometry.coordinates.slice();
          let imageProperties = e.features[0].properties;

          // Ensure that if the map is zoomed out such that
          // multiple copies of the feature are visible, the
          // popup appears over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `<a href="${imageProperties.url}"><img src="${imageProperties.image}" width="${imageProperties.width}" height="${imageProperties.height}" alt="">${imageProperties.title}</a>`
            )
            .addTo(map);
        });

        map.on('mouseenter', 'unclustered-point-photo', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point-photo', function () {
          map.getCanvas().style.cursor = '';
        });
      }
    };

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );
    map.addControl(new mapboxgl.FullscreenControl());

    const mapStyles = [
      {
        title: 'Terrain',
        uri: `${window.location.origin}/map/mapbox-style-terrain.json`,
      },
      {
        title: 'Satellite',
        uri: `${window.location.origin}/map/mapbox-style-satellite.json`,
      },
    ];
    map.addControl(
      new MapboxStyleSwitcherControl(mapStyles, {
        defaultStyle: 'Terrain',
        eventListeners: {
          onChange: () => {
            // TODO: manage localStorage or a cookie to keep track of chosen style
          },
        },
      })
    );

    // After the last frame rendered before the map enters an "idle" state.
    map.on('idle', () => {
      addLayers();
    });
  }
})(window);
