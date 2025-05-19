import {
	axisX,
	barY,
	dot,
	frame,
	group,
	groupX,
	hexagon,
	hexbin,
	plot,
	pointer,
	ruleY,
	tip,
} from "@observablehq/plot";

const generateStats = async () => {
	const photosData = await fetch("/api/photos/stats.json").then((response) =>
		response.json(),
	);

	const photosPerYear = plot({
		marginBottom: 50,
		x: { tickRotate: 90 },
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Purples",
		},
		marks: [
			barY(photosData, groupX({ y: "count", fill: "count" }, { x: "year" })),
			ruleY([0]),
		],
	});
	document.getElementById("photos_per_year").append(photosPerYear);

	const photosPerBrand = plot({
		y: {
			label: "↑ Count of photos by brand",
		},
		color: {
			type: "categorical",
			scheme: "Category10",
			label: "Camera brand",
			legend: true,
		},
		marks: [
			barY(
				photosData.filter((photo) => photo.camera),
				groupX(
					{ y: "count" },
					{
						x: "camera_brand",
						sort: { x: "y", reverse: true },
						fill: "camera_brand",
					},
				),
			),
		],
	});
	document.getElementById("photos_per_brand").append(photosPerBrand);

	const photosPerYearAndBrand = plot({
		marginBottom: 50,
		marginTop: 50,
		x: { tickRotate: 90 },
		y: { grid: true },
		style: {
			background: "#292929",
			color: "#ffffff",
		},
		color: {
			type: "categorical",
			scheme: "Category10",
			label: "Camera brand",
			legend: true,
		},
		marks: [
			barY(
				photosData.filter((photo) => photo.camera_brand),
				group(
					{ y: "count" },
					{ x: "year", y: "count", fill: "camera_brand", tip: "x" },
				),
			),
			ruleY([0]),
		],
	});
	document
		.getElementById("photos_per_year_and_brand")
		.append(photosPerYearAndBrand);

	const photosPerCamera = plot({
		marginBottom: 130,
		marginTop: 30,
		y: {
			label: "↑ Count of photos by camera",
		},
		color: {
			type: "categorical",
			scheme: "Category10",
			label: "Camera",
			legend: true,
		},
		marks: [
			barY(
				photosData.filter((photo) => photo.camera),
				groupX(
					{ y: "count" },
					{ x: "camera", sort: { x: "y", reverse: true }, fill: "camera" },
				),
			),
			axisX({ tickRotate: 90, lineWidth: 9 }),
		],
	});
	document.getElementById("photos_per_camera").append(photosPerCamera);

	const photosPerYearAndCamera = plot({
		marginBottom: 50,
		marginTop: 50,
		x: { tickRotate: 90 },
		y: { grid: true },
		color: {
			type: "categorical",
			scheme: "Category10",
			label: "Camera brand",
			legend: true,
		},
		marks: [
			barY(
				photosData.filter((photo) => photo.camera),
				group({ y: "count" }, { x: "year", y: "count", fill: "camera" }),
			),
			ruleY([0]),
		],
	});
	document
		.getElementById("photos_per_year_and_camera")
		.append(photosPerYearAndCamera);

	const focalLengths = plot({
		marginBottom: 50,
		x: { tickRotate: 90 },
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Purples",
		},
		marks: [
			barY(
				photosData,
				groupX({ y: "count", fill: "count" }, { x: "focal_length" }),
			),
			ruleY([0]),
		],
	});
	document.getElementById("focal_lengths").append(focalLengths);

	const apertures = plot({
		marginBottom: 50,
		x: { tickRotate: 90 },
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Purples",
		},
		marks: [
			barY(
				photosData,
				groupX({ y: "count", fill: "count" }, { x: "aperture" }),
			),
			ruleY([0]),
		],
	});
	document.getElementById("apertures").append(apertures);

	const isos = plot({
		marginBottom: 50,
		x: { tickRotate: 90 },
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Purples",
		},
		marks: [
			barY(photosData, groupX({ y: "count", fill: "count" }, { x: "iso" })),
			ruleY([0]),
		],
	});
	document.getElementById("isos").append(isos);

	const shutterSpeeds = plot({
		marginBottom: 50,
		x: { tickRotate: 90 },
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Purples",
		},
		marks: [
			barY(
				photosData,
				groupX({ y: "count", fill: "count" }, { x: "shutter_speed" }),
			),
			ruleY([0]),
		],
	});
	document.getElementById("shutter_speeds").append(shutterSpeeds);

	const aperturesPerYear = plot({
		marginBottom: 50,
		marginTop: 50,
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Warm",
		},
		marks: [
			dot(
				photosData,
				group({ r: "count", fill: "count" }, { x: "year", y: "aperture" }),
			),
			ruleY([0]),
			tip(
				photosData,
				pointer({
					x: "year",
					y: "aperture",
					title: (d) => `aperture ${d.readable_aperture} in ${d.year}`,
				}),
			),
		],
	});
	document.getElementById("apertures_per_year").append(aperturesPerYear);

	const shutterSpeedsPerYear = plot({
		marginBottom: 50,
		marginTop: 50,
		y: { type: "log", grid: true },
		color: {
			type: "linear",
			scheme: "Warm",
		},
		marks: [
			dot(
				photosData,
				group({ r: "count", fill: "count" }, { x: "year", y: "shutter_speed" }),
			),
			ruleY([0]),
			tip(
				photosData,
				pointer({
					x: "year",
					y: "shutter_speed",
					title: (d) =>
						`shutter speed ${d.readable_shutter_speed} in ${d.year}`,
				}),
			),
		],
	});
	document
		.getElementById("shutter_speeds_per_year")
		.append(shutterSpeedsPerYear);

	const isosPerYear = plot({
		marginBottom: 50,
		marginTop: 50,
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Warm",
		},
		marks: [
			dot(
				photosData,
				group({ r: "count", fill: "count" }, { x: "year", y: "iso" }),
			),
			ruleY([0]),
			tip(
				photosData,
				pointer({
					x: "year",
					y: "iso",
					title: (d) => `ISO ${d.readable_iso} in ${d.year}`,
				}),
			),
		],
	});
	document.getElementById("isos_per_year").append(isosPerYear);

	const aperturesAndShutterSpeeds = plot({
		inset: 20,
		marginBottom: 50,
		marginTop: 50,
		y: { type: "log", grid: true },
		color: {
			type: "linear",
			scheme: "Warm",
		},
		marks: [
			frame(),
			dot(
				photosData,
				group(
					{ r: "count", fill: "count" },
					{ x: "aperture", y: "shutter_speed" },
				),
			),
			ruleY([0]),
			tip(
				photosData,
				pointer({
					x: "aperture",
					y: "shutter_speed",
					title: (d) => `${d.readable_shutter_speed} at ${d.readable_aperture}`,
				}),
			),
		],
	});
	document
		.getElementById("apertures_and_shutter_speeds")
		.append(aperturesAndShutterSpeeds);

	const aperturesAndShutterSpeeds2 = plot({
		inset: 20,
		marginBottom: 50,
		marginTop: 50,
		y: { type: "log", grid: true },
		color: {
			type: "linear",
			scheme: "YlOrRd",
		},
		marks: [
			frame(),
			hexagon(
				photosData,
				hexbin(
					{ fill: "count" },
					{ x: "aperture", y: "shutter_speed", symbol: "square" },
				),
			),
		],
	});
	document
		.getElementById("apertures_and_shutter_speeds_2")
		.append(aperturesAndShutterSpeeds2);

	const isosPerCamera = plot({
		inset: 20,
		marginBottom: 120,
		marginTop: 50,
		y: { grid: true },
		color: {
			type: "linear",
			scheme: "Warm",
		},
		marks: [
			frame(),
			dot(
				photosData,
				group({ r: "count", fill: "count" }, { x: "camera", y: "iso" }),
			),
			axisX({ tickRotate: 90, lineWidth: 9 }),
		],
	});
	document.getElementById("isos_per_camera").append(isosPerCamera);
};

generateStats();
