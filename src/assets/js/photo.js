import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';

(function (window) {
	// Load Mapbox map if necessary
	const mapElementId = 'map';
	const mapElement = window.document.querySelector(`#${mapElementId}`);
	const mapLatitude = mapElement.dataset.latitude;
	const mapLongitude = mapElement.dataset.longitude;

	if (mapElement) {
		mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
		let map = new mapboxgl.Map({
			container: mapElementId,
			style: `mapbox://styles/${window.mapboxStyle}`,
			center: [mapLongitude, mapLatitude],
			zoom: 6,
			scrollZoom: false,
			attributionControl: false,
		});
		map.dragRotate.disable();
		map.touchZoomRotate.disableRotation();

		let markerShadow = document.createElement('div');
		markerShadow.className = 'marker-shadow';
		new mapboxgl.Marker({
			element: markerShadow,
			draggable: false,
			offset: [0, -4],
		})
			.setLngLat([mapLongitude, mapLatitude])
			.addTo(map);

		let marker = document.createElement('div');
		marker.className = 'marker';
		new mapboxgl.Marker({
			element: marker,
			draggable: false,
			offset: [0, -12],
		})
			.setLngLat([mapLongitude, mapLatitude])
			.addTo(map);

		map.addControl(
			new mapboxgl.NavigationControl({ showCompass: false }),
			'top-right'
		);
		map.addControl(new mapboxgl.FullscreenControl());
	}
})(window);
