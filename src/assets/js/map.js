import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import AnimatedPopup from "mapbox-gl-animated-popup";
import GlobeMinimap from "mapbox-gl-globe-minimap";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import polylabel from "polylabel";

const POPUP_OPENING_ANIMATION = {
	duration: 500,
	easing: "easeOutBack",
	transform: "scale",
};
const POPUP_CLOSING_ANIMATION = {
	duration: 300,
	easing: "easeInBack",
	transform: "scale",
};

const FLY_INTERVAL = 3000;
const FLY_SPEED = 0.2;
// https://docs.mapbox.com/mapbox-gl-js/api/properties/#paddingoptions
const FLY_TO_PADDING = {
	top: window.innerHeight * 0.3, // 30% of the viewport height
	bottom: 0,
	left: 0,
	right: 0,
};

const PITCH_MIN = 30; // Minimum pitch angle
const PITCH_MAX = 60; // Maximum pitch angle
const PITCH_STEP = 10; // Step size for pitch angle changes

const SMALL_VERSION_PIXELS = 900 * 600;

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

	let popup = null;
	let flying = false;
	let bearing = 0;
	let pitch = 45; // Start with a default pitch angle

	if (mapElement) {
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
			cooperativeGestures: false, // https://docs.mapbox.com/mapbox-gl-js/example/cooperative-gestures/
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

			// **********************************************************
			// Add a layer for clusters circles
			// **********************************************************

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
					layout: {
						"text-allow-overlap": true,
						"icon-allow-overlap": true,
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
							(_err, clusterFeatures) => {
								let popupString = "";
								if (map.getZoom() === maxZoomLevel) {
									// Show photos from cluster
									const childrenCount = Object.keys(clusterFeatures).length;
									for (const feature of clusterFeatures) {
										const imageProperties = feature.properties;
										popupString += `<p><a href="${imageProperties.url}"><img src="${imageProperties.image}" width="${imageProperties.width}" height="${imageProperties.height}" alt>${imageProperties.title}</a></p>`;
									}

									if (popup) {
										popup.remove();
										popup = null;
									}

									popup = new AnimatedPopup({
										openingAnimation: POPUP_OPENING_ANIMATION,
										closingAnimation: POPUP_CLOSING_ANIMATION,
									})
										.setLngLat(coordinates)
										.setHTML(
											`<div class="mapboxgl-popup-photos"><p>${childrenCount} photos:</p>${popupString}</div>`,
										)
										.addTo(map);
									popup.on("close", () => {});
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

											map.flyTo({
												center: polylabel([clusterMarkers]),
												padding: FLY_TO_PADDING,
												zoom: zoom + 1, // TODO: still doesn't with +1 ???
												speed: 0.5,
											});
										});
								}
							},
						);
				});

				map.on("mouseenter", "clusters", () => {
					map.getCanvas().style.cursor = "pointer";
				});

				map.on("mouseleave", "clusters", () => {
					map.getCanvas().style.cursor = "";
				});
			}

			// **********************************************************
			// Add a layer for clusters counts
			// **********************************************************

			if (!map.getLayer("cluster-count")) {
				map.addLayer({
					id: "cluster-count",
					type: "symbol",
					source: "photos",
					filter: ["has", "point_count"],
					layout: {
						"text-field": "{point_count_abbreviated}",
						"text-size": 12,
						"text-allow-overlap": true,
						"icon-allow-overlap": true,
					},
					paint: {
						"text-color": "#ffffff",
					},
				});
			}

			// **********************************************************
			// Add a layer for photos that are not clustered
			// **********************************************************

			if (!map.getLayer("unclustered-point-photo")) {
				map.addLayer({
					id: "unclustered-point-photo",
					type: "symbol",
					source: "photos",
					filter: ["!", ["has", "point_count"]],
					sprite: `${window.location.origin}/ui/thumbnails/sprite`,
					layout: {
						"icon-image": "{slug}",
						"symbol-z-elevate": true,
						"icon-occlusion-opacity": 1,
						"icon-allow-overlap": true,
						"icon-ignore-placement": false,
					},
				});

				map.on("click", "unclustered-point-photo", (e) => {
					const photoData = e.features[0];
					const photoProperties = photoData.properties;
					const coordinates = photoData.geometry.coordinates.slice();

					// Ensure that if the map is zoomed out such that
					// multiple copies of the feature are visible, the
					// popup appears over the copy being pointed to.
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}

					const ratio = photoProperties.width / photoProperties.height;
					const targetHeight = Math.sqrt(SMALL_VERSION_PIXELS / ratio);
					const targetWidth = ratio * targetHeight;

					if (popup) {
						popup.remove();
						popup = null;
					}

					popup = new AnimatedPopup({
						openingAnimation: POPUP_OPENING_ANIMATION,
						closingAnimation: POPUP_CLOSING_ANIMATION,
						offset: 20,
						maxWidth: `${Math.floor(targetWidth / 2)}px`,
						className: `interactive ${photoData.properties.height / photoData.properties.width > 1 ? "portrait" : "landscape"}`,
					})
						.setLngLat(coordinates)
						.setHTML(
							`<a href="${photoProperties.url}"><img src="/photos/${photoProperties.slug}/small.jpg" width="${targetWidth / 2}" height="${targetHeight / 2}" alt>${photoProperties.title}</a>`,
						)
						.addTo(map);
					popup.on("close", () => {});
				});

				map.on("mouseenter", "unclustered-point-photo", () => {
					map.getCanvas().style.cursor = "pointer";
				});

				map.on("mouseleave", "unclustered-point-photo", () => {
					map.getCanvas().style.cursor = "";
				});
			}
		};

		const addControls = () => {
			// Add navigation controls
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
						onChange: (_event, style) => {
							localStorage.setItem(
								"mapStyle",
								style.match(/satellite/) ? "Satellite" : "Terrain",
							);
							// map.setConfigProperty(style.match(/satellite/) ? "satellite" : "terrain", 'show3dObjects', false);
							addLayers();
						},
					},
				}),
			);

			class AutoPlayButton {
				onAdd(map) {
					let currentlyPlaying = false;
					let currentPhotoIndex =
						Number.parseInt(localStorage.getItem("currentPhotoIndex"), 10) || 0;
					// let intervalID = null;

					const flyToNextPhoto = () => {
						if (popup) {
							popup.remove();
							popup = null;
						}

						const photoData = window.geoJsonFeatures[currentPhotoIndex];
						const photoProperties = photoData.properties;

						// Calculate target height and width based on the aspect ratio
						const ratio = photoProperties.width / photoProperties.height;
						// Ensure the target height does not exceed 40% of the viewport height
						let targetHeight = Math.min(
							Math.sqrt(SMALL_VERSION_PIXELS / ratio),
							window.innerHeight * 0.5,
						);
						let targetWidth = ratio * targetHeight;

						// Ensure the target width does not exceed 40% of the viewport width
						// This is to prevent the popup from being too large on smaller screens
						if (targetWidth > window.innerWidth * 0.8) {
							targetWidth = window.innerWidth * 0.8;
							targetHeight = targetWidth / ratio;
						}

						// Either use the direction embedded in the photo's metadata, or a random variation from previous bearing
						bearing =
							photoData.geometry.direction ||
							(bearing + Math.random() * 60 - 30) % 360; // 360 degrees starting from North
						// console.log(`Bearing: ${bearing}`);

						// Use a random pitch variation from previous one, but ensure it stays within 30 to 60 degrees
						pitch = Math.max(
							PITCH_MIN,
							Math.min(
								PITCH_MAX,
								pitch + Math.random() * PITCH_STEP * 2 - PITCH_STEP,
							),
						); // 0 (zenith) -> 90 degrees
						// console.log(`Pitch: ${pitch}`);

						flying = true;
						map.flyTo({
							center: photoData.geometry.coordinates,
							padding: FLY_TO_PADDING,
							zoom: 16,
							pitch: pitch,
							bearing: bearing,
							curve: 2,
							speed: FLY_SPEED,
							essential: true, // This animation is considered essential with respect to &prefers-reduced-motion
						});

						// End of flight when the map has stopped moving
						map.once("moveend", () => {
							flying = false;

							if (popup) {
								popup.remove();
								popup = null;
							}

							popup = new AnimatedPopup({
								openingAnimation: POPUP_OPENING_ANIMATION,
								closingAnimation: POPUP_CLOSING_ANIMATION,
								offset: 20,
								closeButton: false,
								maxWidth: `${Math.floor(targetWidth)}px`,
								className: `autoplay ${photoProperties.height / photoProperties.width > 1 ? "portrait" : "landscape"}`,
							})
								.setLngLat(photoData.geometry.coordinates)
								.setHTML(
									`<a href="${photoProperties.url}"><img src="/photos/${photoProperties.slug}/small.jpg" width="${targetWidth}" height="${targetHeight}" alt>${photoProperties.title}</a>`,
								)
								.addTo(map);

							if (currentlyPlaying) {
								setTimeout(flyToNextPhoto, FLY_INTERVAL);
							}
						});

						currentPhotoIndex =
							(currentPhotoIndex + 1) % window.geoJsonFeatures.length;
						localStorage.setItem("currentPhotoIndex", currentPhotoIndex);
					};

					const div = document.createElement("div");
					div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
					div.innerHTML = `<button class="mapboxgl-ctrl-autoplay"><span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Auto play"></span></button>`;
					div.addEventListener("contextmenu", (e) => e.preventDefault());
					div.addEventListener("click", () => {
						currentlyPlaying = !currentlyPlaying;

						if (currentlyPlaying) {
							flyToNextPhoto();
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
					globeSize: Math.min(100, window.innerWidth / 10),
				}),
				"bottom-right",
			);
		};

		map.on("load", () => {
			addLayers();
			addControls();
		});

		map.on("movestart", () => {
			if (flying && popup) {
				popup.remove();
				popup = null;
			}
		});

		map.on("moveend", () => {
			if (flying) {
				flying = false;
			}
		});
	}
})(window);
