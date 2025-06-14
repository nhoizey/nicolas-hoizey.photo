import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import polylabel from "polylabel";
import GlobeMinimap from "mapbox-gl-globe-minimap";

const decodeHTML = (html) => {
	const txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
};

(async (window) => {
	// Load Mapbox map if necessary
	const mapElementId = "map";
	const mapElement = window.document.querySelector(`#${mapElementId}`);
	const maxZoomLevel = 18;
	const clusterSteps = [
		{ count: 5, color: "#835aac", radius: 8 },
		{ count: 10, color: "#663399", radius: 10 },
		{ count: 20, color: "#53297c", radius: 12 },
		{ count: 100, color: "#53297c", radius: 15 },
	];
	const markerStroke = "#ffffff";
	const geoJsonUrl = "/map/photos.geojson";

	const geoJsonResponse = await fetch(geoJsonUrl);
	const geoJsonData = await geoJsonResponse.json();
	window.geoJsonFeatures = geoJsonData.features;

	if (mapElement) {
		let userInteracting = false;
		let clusterMove = false;
		let popupOpened = false;

		mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
		const map = new mapboxgl.Map({
			container: mapElementId,
			style: `${window.location.origin}/map/mapbox-style-${(localStorage.getItem("mapStyle") || "Satellite").toLowerCase()}.json`,
			projection: "globe",
			center: [3, 35],
			zoom: 3,
			minZoom: 1,
			maxZoom: maxZoomLevel,
			scrollZoom: true,
			attributionControl: false,
			cooperativeGestures: true,
			hash: true,
			renderWorldCopies: true,
			transformRequest: (url, resourceType) => {
				// console.log({ url, resourceType });
				if (url.startsWith("https://nicolas-hoizey.photo")) {
					if (resourceType === "SpriteImage") {
						return {
							url: `https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto/${url}?${Date.now()}`,
						};
					}
					if (resourceType === "SpriteJSON") {
						return {
							url: `${url.replace(
								/(\/ui\/thumbnails\/)[0-9]+\/(sprite(@2x)?\.json)$/,
								"$1$2",
							)}?${Date.now()}`,
						};
					}
				}
			},
		});

		const addLayers = () => {
			if (!map.getSource("photos")) {
				map.addSource("photos", {
					type: "geojson",
					data: geoJsonUrl,
					cluster: true,
					clusterMaxZoom: maxZoomLevel,
					clusterRadius: 25, // Radius of each cluster when clustering points (defaults to 50)
				});
			}

			if (!map.getSource("mapbox-dem")) {
				map.addSource("mapbox-dem", {
					type: "raster-dem",
					url: "mapbox://mapbox.mapbox-terrain-dem-v1",
					tileSize: 512,
					maxzoom: maxZoomLevel,
				});
			}

			map.setTerrain({ source: "mapbox-dem", exaggeration: 1.3 });

			if (!map.getLayer("clusters")) {
				map.addLayer({
					id: "clusters",
					type: "circle",
					source: "photos",
					filter: ["has", "point_count"],
					paint: {
						// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
						"circle-color": [
							"step",
							["get", "point_count"],
							clusterSteps[0].color,
							clusterSteps[0].count,
							clusterSteps[1].color,
							clusterSteps[1].count,
							clusterSteps[2].color,
							clusterSteps[2].count,
							clusterSteps[3].color,
						],
						"circle-radius": [
							"step",
							["get", "point_count"],
							clusterSteps[0].radius,
							clusterSteps[0].count,
							clusterSteps[1].radius,
							clusterSteps[1].count,
							clusterSteps[2].radius,
							clusterSteps[2].count,
							clusterSteps[3].radius,
						],
						"circle-stroke-width": 2,
						"circle-stroke-color": markerStroke,
					},
				});

				map.on("click", "clusters", (e) => {
					const features = map.queryRenderedFeatures(e.point, {
						layers: ["clusters"],
					});
					const clusterId = features[0].properties.cluster_id;

					const coordinates = features[0].geometry.coordinates.slice();
					const point_count = features[0].properties.point_count;
					map
						.getSource("photos")
						.getClusterLeaves(
							clusterId,
							point_count,
							0,
							(err, clusterFeatures) => {
								let popupString = "";
								if (map.getZoom() === maxZoomLevel) {
									// Show photos from cluster
									const childrenCount = Object.keys(clusterFeatures).length;
									for (const feature of clusterFeatures) {
										const imageProperties = feature.properties;
										popupString += `<p><a href="${imageProperties.url}"><img src="${imageProperties.image}" width="${imageProperties.width}" height="${imageProperties.height}" alt>${imageProperties.title}</a></p>`;
									}
									popupOpened = true;
									const popup = new mapboxgl.Popup()
										.setLngLat(coordinates)
										.setHTML(
											`<div class="mapboxgl-popup-photos"><p>${childrenCount} photos:</p>${popupString}</div>`,
										)
										.addTo(map);
									popup.on("close", () => {
										popupOpened = false;
									});
								} else {
									// Zoom in cluster
									const clusterMarkers = [];
									for (const feature of clusterFeatures) {
										clusterMarkers.push(feature.geometry.coordinates);
									}
									map
										.getSource("photos")
										.getClusterExpansionZoom(clusterId, (err, zoom) => {
											if (err) return;

											userInteracting = true;
											clusterMove = true;

											map.flyTo({
												center: polylabel([clusterMarkers]),
												zoom: zoom,
												speed: 0.5,
											});
										});
								}
							},
						);
				});

				map.on("mouseenter", "clusters", () => {
					map.getCanvas().style.cursor = "pointer";
					userInteracting = true;
				});
				map.on("mouseleave", "clusters", () => {
					map.getCanvas().style.cursor = "";
					userInteracting = false;
				});
			}

			if (!map.getLayer("cluster-count")) {
				map.addLayer({
					id: "cluster-count",
					type: "symbol",
					source: "photos",
					filter: ["has", "point_count"],
					layout: {
						"text-field": "{point_count_abbreviated}",
						"text-size": 12,
					},
					paint: {
						"text-color": "#ffffff",
					},
				});
			}

			if (!map.getLayer("unclustered-point-photo")) {
				map.addLayer({
					id: "unclustered-point-photo",
					type: "symbol",
					source: "photos",
					filter: ["!", ["has", "point_count"]],
					sprite: `${window.location.origin}/ui/thumbnails/sprite`,
					layout: {
						"icon-image": "{slug}",
						"icon-allow-overlap": true,
					},
				});

				map.on("click", "unclustered-point-photo", (e) => {
					const coordinates = e.features[0].geometry.coordinates.slice();
					const imageProperties = e.features[0].properties;

					// Ensure that if the map is zoomed out such that
					// multiple copies of the feature are visible, the
					// popup appears over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}

					popupOpened = true;
					const popup = new mapboxgl.Popup()
						.setLngLat(coordinates)
						.setHTML(
							`<a href="${imageProperties.url}"><img src="${imageProperties.image}" width="${imageProperties.width}" height="${imageProperties.height}" alt>${imageProperties.title}</a>`,
						)
						.addTo(map);
					popup.on("close", () => {
						popupOpened = false;
					});
				});

				map.on("mouseenter", "unclustered-point-photo", () => {
					map.getCanvas().style.cursor = "pointer";
					userInteracting = true;
				});
				map.on("mouseleave", "unclustered-point-photo", () => {
					map.getCanvas().style.cursor = "";
					userInteracting = false;
				});
			}
		};

		const addControls = () => {
			map.addControl(
				new mapboxgl.NavigationControl({
					showCompass: true,
					visualizePitch: true,
				}),
				"top-right",
			);

			// Add button to toggle between 2D and 3D views
			// Based on https://github.com/tobinbradley/mapbox-gl-pitch-toggle-control
			class PitchToggle {
				onAdd(map) {
					const div = document.createElement("div");
					div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
					div.innerHTML = `<button class="mapboxgl-ctrl-3d-toggle"><span class="mapboxgl-ctrl-icon" aria-hidden="true" aria-label="Toggle 3D"></span></button>`;
					if (map.getPitch() !== 0) {
						div
							.querySelector("button")
							.classList.toggle("mapboxgl-ctrl-3d-toggle-active", true);
					}
					div.addEventListener("contextmenu", (e) => e.preventDefault());
					div.addEventListener("click", () => {
						if (map.getPitch() === 0) {
							map.easeTo({ pitch: 70, bearing: -20 });
							div
								.querySelector("button")
								.classList.toggle("mapboxgl-ctrl-3d-toggle-active", true);
						} else {
							map.easeTo({ pitch: 0, bearing: 0 });
							div
								.querySelector("button")
								.classList.toggle("mapboxgl-ctrl-3d-toggle-active", false);
						}
					});

					return div;
				}
			}
			map.addControl(new PitchToggle());

			// Add button to allow users to find their location
			map.addControl(
				new mapboxgl.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true,
					},
					// When active the map will receive updates to the device's location as it changes.
					trackUserLocation: true,
					// Draw an arrow next to the location dot to indicate which direction the device is heading.
					showUserHeading: true,
				}),
			);

			// Add button to toggle fullscreen mode
			map.addControl(new mapboxgl.FullscreenControl());

			// Add buttons to switch between drawn map and satellite photography
			const mapStyles = [
				{
					title: "Satellite",
					uri: `${window.location.origin}/map/mapbox-style-satellite.json`,
				},
				{
					title: "Terrain",
					uri: `${window.location.origin}/map/mapbox-style-terrain.json`,
				},
			];
			map.addControl(
				new MapboxStyleSwitcherControl(mapStyles, {
					defaultStyle: localStorage.getItem("mapStyle") || "Satellite",
					eventListeners: {
						onChange: (event, style) => {
							localStorage.setItem(
								"mapStyle",
								style.match(/satellite/) ? "Satellite" : "Terrain",
							);
						},
					},
				}),
			);

			class AutoPlayButton {
				onAdd(map) {
					let currentlyPlaying = false;
					let currentPhotoIndex =
						Number.parseInt(localStorage.getItem("currentPhotoIndex"), 10) || 0;
					let intervalID = null;
					let popup = null;

					const div = document.createElement("div");
					div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
					div.innerHTML = `<button class="mapboxgl-ctrl-autoplay"><span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Auto play"></span></button>`;
					div.addEventListener("contextmenu", (e) => e.preventDefault());
					div.addEventListener("click", () => {
						currentlyPlaying = !currentlyPlaying;

						const flyToNextPhoto = () => {
							if (popup) {
								popup.remove();
								popup = null;
							}

							const photoData = window.geoJsonFeatures[currentPhotoIndex];

							popup = new mapboxgl.Popup({
								offset: [0, -20],
								closeButton: false,
								maxWidth: "none",
								className: `autoplay ${photoData.properties.height / photoData.properties.width > 1 ? "portrait" : "landscape"}`,
							})
								.setLngLat(photoData.geometry.coordinates)
								.setHTML(
									`<a href="${photoData.properties.url}"><img src="/photos/${photoData.properties.slug}/small.jpg" width="${photoData.properties.width}" height="${photoData.properties.height}" alt>${photoData.properties.title}</a>`,
								)
								.addTo(map);

							map.flyTo({
								center: photoData.geometry.coordinates,
								zoom: 16,
								pitch: 45 + Math.random() * 30, // 0 (zenith) -> 90 degrees
								bearing:
									photoData.geometry.direction || 180 - Math.random() * 360, // -180 -> 180 degrees
								curve: 2,
								// speed: 0.5,
								duration: 10000,
								essential: true, // This animation is considered essential with respect to prefers-reduced-motion
							});

							currentPhotoIndex =
								(currentPhotoIndex + 1) % window.geoJsonFeatures.length;
							localStorage.setItem("currentPhotoIndex", currentPhotoIndex);
						};

						if (currentlyPlaying) {
							flyToNextPhoto();
							intervalID = setInterval(flyToNextPhoto, 15000);
						} else {
							clearInterval(intervalID);
							intervalID = null;
						}
						div
							.querySelector("button")
							.classList.toggle(
								"mapboxgl-ctrl-autoplay-active",
								currentlyPlaying,
							);
					});

					return div;
				}
			}
			map.addControl(new AutoPlayButton());

			// https://docs.mapbox.com/mapbox-gl-js/example/navigation-scale/
			map.addControl(new mapboxgl.ScaleControl());

			map.addControl(
				new GlobeMinimap({
					globeSize: Math.min(100, window.innerWidth / 10)
				}),
				"bottom-right"
			);
		}

		// After the last frame rendered before the map enters an "idle" state.
		// map.on("idle", () => {

		// 	// Compute new position every… in milliseconds
		// 	const rotationInterval = 500;
		// 	// At low zooms, complete a revolution every 5 minutes.
		// 	const secondsPerRevolution = 5 * 60;
		// 	// Above zoom level 4, do not rotate.
		// 	const maxSpinZoom = 4;
		// 	// Rotate at intermediate speeds between zoom levels 2 and 4.
		// 	const slowSpinZoom = 2;

		// 	// Respect user preference for reduced motion
		// 	let animationAllowed = window.matchMedia(
		// 		"(prefers-reduced-motion: no-preference)",
		// 	).matches;
		// 	window
		// 		.matchMedia("(prefers-reduced-motion)")
		// 		.addEventListener("change", () => {
		// 			animationAllowed = window.matchMedia(
		// 				"(prefers-reduced-motion: no-preference)",
		// 			).matches;
		// 		});

		// 	const spinGlobe = (timestamp) => {
		// 		const zoom = map.getZoom();
		// 		if (
		// 			animationAllowed &&
		// 			!userInteracting &&
		// 			!popupOpened &&
		// 			zoom < maxSpinZoom
		// 		) {
		// 			let distancePerInterval =
		// 				(360 / secondsPerRevolution) * (rotationInterval / 1000);
		// 			if (zoom > slowSpinZoom) {
		// 				// Slow spinning at higher zooms
		// 				const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
		// 				distancePerInterval *= zoomDif;
		// 			}
		// 			const center = map.getCenter();
		// 			center.lng -= distancePerInterval;
		// 			// Smoothly animate the map over one second.
		// 			// When this animation is complete, it calls a 'moveend' event.
		// 			map.easeTo({
		// 				center,
		// 				duration: rotationInterval,
		// 				easing: (n) => n,
		// 			});
		// 		}
		// 		setTimeout(requestAnimationFrame, rotationInterval, spinGlobe);
		// 	};
		// 	// TODO: allow activation of spinning with a button
		// 	requestAnimationFrame(spinGlobe);
		// });

		// // Pause spinning on interaction
		// map.on("mousedown", () => {
		// 	userInteracting = true;
		// });

		// // Restart spinning the globe when interaction is complete
		// map.on("mouseup", () => {
		// 	userInteracting = false;
		// });

		// // These events account for cases where the mouse has moved
		// // off the map, so 'mouseup' will not be fired.
		// map.on("dragend", () => {
		// 	userInteracting = false;
		// });
		// map.on("pitchend", () => {
		// 	userInteracting = false;
		// });
		// map.on("rotateend", () => {
		// 	userInteracting = false;
		// });
		// map.on("moveend", () => {
		// 	if (userInteracting && clusterMove) {
		// 		userInteracting = false;
		// 		clusterMove = false;
		// 	}
		// });

		map.on("load", () => {
			map.setFog({
				color: "#222222",
				"horizon-blend": 0.05,
				"high-color": "#292929",
				"space-color": "#292929",
				"star-intensity": 0.2,
			});
			addLayers();
			addControls();
		});
	}
})(window);
