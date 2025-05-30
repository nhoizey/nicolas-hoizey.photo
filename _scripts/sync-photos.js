#!/usr/bin/env node

// Load .env variables with dotenv
import {} from "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";
import Fraction from "fraction.js";
import { DateTime } from "luxon";
import { Vibrant } from "node-vibrant/node";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";
import utf8 from "utf8";
import YAML from "yaml";
import { decodeHTML } from "entities";

import slugify from "../src/_11ty/_utils/slugify.js";

const SRC =
	"/Users/nicolashoizey/Library/Mobile Documents/com~apple~CloudDocs/Documents/Photographie/_Site web/";
const DIST = "./src/collections/photos/";
const THUMBNAILS = "./_temp/thumbnails/";
const DIFFS = path.join(SRC, "_temp_diffs");
const SMALL_VERSION_PIXELS = 900 * 600;

import CLEAN_GEAR from "../src/_data/gear.json" with { type: "json" };
const MISSING_GEAR = { cameras: [], lenses: [] };

import photosData from "../_cache/photos-data.json" with { type: "json" };

// Create folders for thumbnails
if (!fs.existsSync(path.join(THUMBNAILS, "icons"))) {
	fs.mkdirSync(path.join(THUMBNAILS, "icons"));
}
if (!fs.existsSync(path.join(THUMBNAILS, "icons@2x"))) {
	fs.mkdirSync(path.join(THUMBNAILS, "icons@2x"));
}

const exifrOptions = {
	mergeOutput: false,
	crs: false,
	dc: false,
	lr: false,
	photoshop: false,
	ifd0: {
		pick: ["Make", "Model", "ImageDescription"],
	},
	exif: [
		"DateTimeOriginal",
		"OffsetTime",
		"ExposureTime",
		"ISO",
		"FNumber",
		"FocalLength",
		"FocalLengthIn35mmFormat",
		"LensModel",
	],

	gps: {
		pick: ["latitude", "longitude"],
	},
	iptc: { pick: ["ObjectName", "Caption", "Country", "City"] },
	xmp: { pick: ["AltTextAccessibility", "ExtDescrAccessibility"] },
	userComment: false,
};

async function syncOnePhoto(photo) {
	if (photo === ".DS_Store") return;

	let logged = false;
	const thisLog = (msg) => {
		if (!logged) {
			console.log(`
SYNC ${photo}`);
			logged = true;
		}
		console.error(msg);
		return logged;
	};

	const photoPath = path.join(SRC, photo);
	const ext = path.extname(photoPath);
	if (ext !== ".jpg") {
		return;
	}
	const photoYFM = {};
	const photoExif = await exifr.parse(photoPath, exifrOptions);

	if (photoExif === undefined) {
		thisLog("  ⚠ error reading EXIF data");
	} else {
		if (undefined === photosData[photo]) {
			photosData[photo] = {};
		}

		// Clean useless data
		delete photoExif.crs;
		delete photoExif.lr;
		delete photoExif.photoshop;
		delete photoExif.xmpMM;

		const missingData = {};

		let copyPhotoFile = false;
		if (JSON.stringify(photosData[photo].raw) !== JSON.stringify(photoExif)) {
			thisLog("  ⚠ EXIF data are new or changed");
			photosData[photo].raw = photoExif;
			copyPhotoFile = true;
		}

		if (undefined === photoExif.dc.title.value) {
			thisLog(`  ⚠ "photoExif.dc.title.value" missing`);
			photoYFM.title = photo.replace(/[-0-9]+ (.*)\.[^.]+$/, "$1");
		} else {
			// Get title
			photoYFM.title = decodeHTML(photoExif.dc.title.value);
		}

		// Compute folder and file paths from title
		const slug = slugify(photoYFM.title);
		photoYFM.file = `${slug}${ext}`;
		const distDir = path.join(DIST, slug);
		const distPhoto = path.join(distDir, `${slug}${ext}`);

		// Get alt text from XMP's AltTextAccessibility or IPTC's userComment or Headline
		// TODO: also use ExtDescrAccessibility as long description
		let photoAltText = "";
		if (photoExif.Iptc4xmpCore?.AltTextAccessibility?.value) {
			photoAltText = photoExif.Iptc4xmpCore.AltTextAccessibility.value.trim();
		}
		if (photoAltText.length === 0) {
			missingData.alt_text = true;
		} else {
			photoYFM.alt_text = photoAltText;
		}

		// Get caption/description
		let photoDescription = "";
		if (photoExif.ifd0.ImageDescription) {
			photoDescription = photoExif.ifd0.ImageDescription.trim();
		}
		if (photoDescription.length === 0) {
			missingData.description = true;
		}

		// get photo date
		let luxonDate;
		if (photoExif.exif.DateTimeOriginal && photoExif.exif.OffsetTime) {
			luxonDate = DateTime.fromHTTP(
				photoExif.exif.DateTimeOriginal.toGMTString(),
			).setZone(`UTC+${Number.parseInt(photoExif.exif.OffsetTime, 10)}`);
		} else {
			thisLog("  ⚠ exif.DateTimeOriginal missing");
			if (
				photoExif.iptc.DigitalCreationDate &&
				photoExif.iptc.DigitalCreationTime
			) {
				luxonDate = DateTime.fromFormat(
					`${photoExif.iptc.DigitalCreationDate} ${photoExif.iptc.DigitalCreationTime}`,
					"yyyyLLdd HHmmssZZZ",
				);
			} else {
				thisLog("  ⚠ iptc.DigitalCreationDate");
				luxonDate = DateTime.fromFormat(
					`${photo.slice(0, 10)} 12:00:00 Z`,
					"yyyy-LL-dd HH:mm:ss Z",
				);
			}
		}
		photoYFM.date = luxonDate.toFormat("yyyy-LL-dd HH:mm:ss ZZ");

		// Prevent parsing of dates as string when using Matter in photo-data.js
		// https://github.com/jonschlinkert/gray-matter/issues/62#issuecomment-1720216543
		photoYFM.dates = {
			iso: `'${luxonDate.toFormat("yyyy-LL-dd")}'`,
			human: `'${luxonDate.toFormat("d LLLL yyyy")}'`,
		};

		if (photoExif.ifd0.Model || photoExif.exif.LensModel) {
			// Get gear
			photoYFM.gear = { short: "" };
			if (photoExif.ifd0.Make || photoExif.ifd0.Model) {
				const makeAndModel = `${photoExif.ifd0.Make || ""} ${
					photoExif.ifd0.Model || ""
				}`;
				if (CLEAN_GEAR.cameras[makeAndModel] === undefined) {
					if (!MISSING_GEAR.cameras.includes(makeAndModel)) {
						MISSING_GEAR.cameras.push(makeAndModel);
					}
					photoYFM.gear.camera = {
						brand: photoExif.ifd0.Make || "unknown",
						model: photoExif.ifd0.Model || "unknown",
					};
					photoYFM.gear.short = [
						photoExif.ifd0.Make || "",
						photoExif.ifd0.Model || "",
					].join(" ");
				} else {
					photoYFM.gear.camera = CLEAN_GEAR.cameras[makeAndModel];
					photoYFM.gear.short = [
						CLEAN_GEAR.cameras[makeAndModel].brand || "",
						CLEAN_GEAR.cameras[makeAndModel].short ||
							CLEAN_GEAR.cameras[makeAndModel].model ||
							"",
					].join(" ");
				}
			} else {
				missingData.camera = true;
			}

			if (photoExif.exif.LensModel) {
				if (CLEAN_GEAR.lenses[photoExif.exif.LensModel] === undefined) {
					if (!MISSING_GEAR.lenses.includes(photoExif.exif.LensModel)) {
						MISSING_GEAR.lenses.push(photoExif.exif.LensModel);
					}
					photoYFM.gear.lenses = [
						{
							brand: "unknown",
							model: photoExif.exif.LensModel,
						},
					];
					photoYFM.gear.short += ` + ${photoExif.exif.LensModel}`;
				} else {
					if (CLEAN_GEAR.lenses[photoExif.exif.LensModel] !== false) {
						if (Array.isArray(CLEAN_GEAR.lenses[photoExif.exif.LensModel])) {
							photoYFM.gear.lenses =
								CLEAN_GEAR.lenses[photoExif.exif.LensModel];
						} else {
							photoYFM.gear.lenses = [
								CLEAN_GEAR.lenses[photoExif.exif.LensModel],
							];
						}
						for (const lens of photoYFM.gear.lenses) {
							photoYFM.gear.short += ` +${
								lens.brand !== (photoYFM.gear.camera.brand || "")
									? ` ${lens.brand}`
									: ""
							} ${lens.short || lens.model || ""}`;
						}
					}
				}
			} else {
				missingData.lens = true;
			}
		}

		if (photoExif.iptc.Keywords) {
			photoYFM.tags = photoExif.iptc.Keywords.map((keyword) =>
				utf8.decode(keyword),
			).sort((a, b) => a.localeCompare(b, "en"));
		}

		if (
			photoExif.exif.FocalLength ||
			photoExif.exif.FocalLengthIn35mmFormat ||
			photoExif.exif.ISO ||
			photoExif.exif.FNumber ||
			photoExif.exif.ExposureTime
		) {
			photoYFM.settings = {};

			// Focal length
			if (
				photoExif.exif.FocalLength ||
				photoExif.exif.FocalLengthIn35mmFormat
			) {
				photoYFM.settings.focal_length = {};
				if (photoExif.exif.FocalLength) {
					photoYFM.settings.focal_length.raw = photoExif.exif.FocalLength;
				}

				if (photoExif.exif.FocalLengthIn35mmFormat) {
					photoYFM.settings.focal_length.eq35mm =
						photoExif.exif.FocalLengthIn35mmFormat;
				}

				photoYFM.settings.focal_length.computed =
					photoYFM.settings.focal_length.eq35mm ||
					photoYFM.settings.focal_length.raw;

				photoYFM.settings.focal_length.readable = `${photoYFM.settings.focal_length.computed} mm`;

				photoYFM.settings.focal_length.slug = slugify(
					photoYFM.settings.focal_length.readable,
				);
			}

			if (photoExif.exif.ISO) {
				photoYFM.settings.iso = {
					raw: photoExif.exif.ISO,
					computed: photoExif.exif.ISO,
					readable: `${photoExif.exif.ISO}`,
					slug: slugify(`${photoExif.exif.ISO}`),
				};
			}

			if (photoExif.exif.FNumber) {
				photoYFM.settings.aperture = {
					raw: photoExif.exif.FNumber,
					computed: photoExif.exif.FNumber,
					readable: `ƒ/${photoExif.exif.FNumber}`,
					slug: slugify(`f/${photoExif.exif.FNumber}`),
				};
			}

			if (photoExif.exif.ExposureTime) {
				photoYFM.settings.shutter_speed = {
					raw: photoExif.exif.ExposureTime,
					computed: photoExif.exif.ExposureTime,
				};

				// Add exposure time as a fraction for readability
				const t = new Fraction(photoExif.exif.ExposureTime);

				photoYFM.settings.shutter_speed.readable = `${t.toFraction(true)} s`;

				photoYFM.settings.shutter_speed.slug = slugify(
					photoYFM.settings.shutter_speed.readable,
				);
			}
		}

		// Get image dimensions
		if (photosData[photo].dimensions) {
			photoYFM.dimensions = photosData[photo].dimensions;
		} else {
			const metadata = await sharp(photoPath).metadata();
			photoYFM.dimensions = {
				width: metadata.width,
				height: metadata.height,
			};

			photosData[photo].dimensions = photoYFM.dimensions;
		}

		// Get coordinates
		if (photoExif.gps.latitude && photoExif.gps.longitude) {
			if (
				photoExif.gps.latitude >=
					Number.parseFloat(process.env.HOME_1_LATITUDE_MIN) &&
				photoExif.gps.latitude <=
					Number.parseFloat(process.env.HOME_1_LATITUDE_MAX) &&
				photoExif.gps.longitude >=
					Number.parseFloat(process.env.HOME_1_LONGITUDE_MIN) &&
				photoExif.gps.longitude <=
					Number.parseFloat(process.env.HOME_1_LONGITUDE_MAX)
			) {
				// Removing position for photo in home 1 area
			} else if (
				photoExif.gps.latitude >=
					Number.parseFloat(process.env.HOME_2_LATITUDE_MIN) &&
				photoExif.gps.latitude <=
					Number.parseFloat(process.env.HOME_2_LATITUDE_MAX) &&
				photoExif.gps.longitude >=
					Number.parseFloat(process.env.HOME_2_LONGITUDE_MIN) &&
				photoExif.gps.longitude <=
					Number.parseFloat(process.env.HOME_2_LONGITUDE_MAX)
			) {
				// Removing position for photo in home 2 area
			} else {
				photoYFM.geo = {
					latitude: photoExif.gps.latitude,
					longitude: photoExif.gps.longitude,
				};
				if (photoExif.iptc.Country) {
					photoYFM.geo.country = utf8.decode(photoExif.iptc.Country);
				}
				if (photoExif.iptc.City) {
					// photoYFM.geo.city = photoExif.iptc.City;
					photoYFM.geo.city = utf8.decode(photoExif.iptc.City);
				}

				// Get map for the photo
				const mapFile = path.join(distDir, "map.png");
				if (fs.existsSync(mapFile)) {
					photoYFM.geo.map = true;
				} else {
					missingData.map = true;
				}

				// Generate thumbnails for 1x screens
				const thumbFile = path.join(THUMBNAILS, "icons", `${slug}.png`);
				if (!fs.existsSync(thumbFile)) {
					const mask = Buffer.from(
						'<svg><circle cx="15" cy="15" r="14" fill="black"/></svg>',
					);
					const border = Buffer.from(
						'<svg><circle cx="15" cy="15" r="14" fill="none" stroke="white" stroke-width="2" /></svg>',
					);
					sharp(photoPath)
						.resize(30, 30, {
							fit: sharp.fit.cover,
							position: sharp.strategy.entropy,
						})
						.composite([
							{ input: mask, left: 0, top: 0, blend: "dest-in" },
							{ input: border, left: 0, top: 0, blend: "over" },
						])
						.toFile(thumbFile, (err) => {
							if (err) {
								thisLog(`Error while creating thumbnail file for ${slug}`, err);
							}
						});
				}

				// Generate thumbnails for 2x screens
				const thumb2File = path.join(THUMBNAILS, "icons@2x", `${slug}.png`);
				if (!fs.existsSync(thumb2File)) {
					const mask2x = Buffer.from(
						'<svg><circle cx="30" cy="30" r="28" fill="black"/></svg>',
					);
					const border2 = Buffer.from(
						'<svg><circle cx="30" cy="30" r="28" fill="none" stroke="white" stroke-width="3" /></svg>',
					);
					sharp(photoPath)
						.resize(60, 60, {
							fit: sharp.fit.cover,
							position: sharp.strategy.entropy,
						})
						.composite([
							{ input: mask2x, left: 0, top: 0, blend: "dest-in" },
							{ input: border2, left: 0, top: 0, blend: "over" },
						])
						.toFile(thumb2File, (err) => {
							if (err) {
								thisLog(
									`Error while creating @2x thumbnail file for ${slug}`,
									err,
								);
							}
						});
				}
			}
		} else {
			missingData.geolocation = true;
		}

		// Check opengraph image for the photo
		const opengraphFile = path.join(distDir, "opengraph.jpg");
		if (!fs.existsSync(opengraphFile)) {
			missingData.opengraph = true;
		}

		if (photosData[photo].colors) {
			photoYFM.colors = photosData[photo].colors;
		} else {
			// Get photo dominant color with Vibrant.js
			const palette = await Vibrant.from(photoPath).getPalette();
			photoYFM.colors = {
				vibrant: palette.Vibrant.rgb.join(" "),
				darkVibrant: palette.DarkVibrant.rgb.join(" "),
				lightVibrant: palette.LightVibrant.rgb.join(" "),
				muted: palette.Muted.rgb.join(" "),
				darkMuted: palette.DarkMuted.rgb.join(" "),
				lightMuted: palette.LightMuted.rgb.join(" "),
			};
			photosData[photo].colors = photoYFM.colors;
		}

		// Generate LQIP for photo page
		if (photosData[photo].lqip) {
			photoYFM.lqip = photosData[photo].lqip;
		} else {
			const { data, info } = await sharp(photoPath)
				.resize({
					width: 100,
				})
				.blur(1)
				.webp({ quality: 10, alphaQuality: 0, smartSubsample: true })
				.toBuffer({ resolveWithObject: true })
				.then(({ data, info }) => {
					return { data, info };
				});
			photoYFM.lqip = `data:image/webp;base64,${data.toString("base64")}`;
			photosData[photo].lqip = photoYFM.lqip;
		}

		// Add missing data
		if (Object.keys(missingData).length > 0) {
			photoYFM.missing_data = missingData;
		}

		// Manage folder and file
		if (!fs.existsSync(distDir)) {
			fs.mkdirSync(distDir);
		}

		// Check if photo is already in dist
		if (!fs.existsSync(distPhoto)) {
			copyPhotoFile = true;
		} else {
			if (!copyPhotoFile) {
				// Check if new and previous photo are visually different
				const existingPhotoBuffer = await sharp(distPhoto)
					.ensureAlpha()
					.png()
					.raw()
					.toBuffer({ resolveWithObject: true })
					.then(({ data, info }) => {
						return { data, info };
					});
				const newPhotoBuffer = await sharp(photoPath)
					.ensureAlpha()
					.png()
					.raw()
					.toBuffer({ resolveWithObject: true })
					.then(({ data, info }) => {
						return { data, info };
					});
				if (
					newPhotoBuffer.info.width !== existingPhotoBuffer.info.width ||
					newPhotoBuffer.info.height !== existingPhotoBuffer.info.height
				) {
					thisLog(
						`New photo is not the same dimensions as the old one: ${existingPhotoBuffer.info.width}x${existingPhotoBuffer.info.height} vs ${newPhotoBuffer.info.width}x${newPhotoBuffer.info.height}`,
					);
					copyPhotoFile = true;
				} else {
					const diffImage = new PNG({
						width: existingPhotoBuffer.info.width,
						height: existingPhotoBuffer.info.height,
					});
					const diff = pixelmatch(
						existingPhotoBuffer.data,
						newPhotoBuffer.data,
						diffImage.data,
						newPhotoBuffer.info.width,
						newPhotoBuffer.info.height,
						{
							threshold: 0.1,
						},
					);

					if (diff > 0) {
						thisLog(`${diff} different pixels for ${photoPath}`);

						// Create temporary folder for image diffs if it's missing
						if (!fs.existsSync(path.join(DIFFS))) {
							fs.mkdirSync(path.join(DIFFS));
						}

						fs.writeFileSync(
							path.join(DIFFS, `${slug}${ext}`),
							PNG.sync.write(diffImage),
						);
						copyPhotoFile = true;
					}
				}
			}
		}

		if (copyPhotoFile) {
			fs.copyFileSync(photoPath, distPhoto);
		}

		// Manage index file
		const mdContent = `---
${YAML.stringify(photoYFM)}---

${photoDescription}
`;

		fs.writeFileSync(path.join(distDir, "index.md"), mdContent);

		// Generate thumbnail for Atom feed
		const smallVersion = path.join(distDir, "small.jpg");
		if (!fs.existsSync(smallVersion)) {
			const ratio = photoYFM.dimensions.width / photoYFM.dimensions.height;
			const targetHeight = Math.sqrt(SMALL_VERSION_PIXELS / ratio);
			const targetWidth = ratio * targetHeight;

			sharp(photoPath)
				.resize({
					width: Math.round(targetWidth),
					height: Math.round(targetHeight),
					fit: sharp.fit.inside,
				})
				.jpeg({ quality: 80 })
				.toFile(smallVersion, (err) => {
					if (err) {
						thisLog(`Error while creating feed thumbnail for ${slug}`, err);
					}
				});
		}
	}
}

async function syncAllPhotos() {
	await fs.readdirSync(SRC).reduce(async (accumulator, photo) => {
		return [...(await accumulator), await syncOnePhoto(photo)];
	}, Promise.resolve([]));
}

syncAllPhotos().then(() => {
	// Todo after everything else
	fs.writeFileSync(
		"./_cache/photos-data.json",
		JSON.stringify(photosData, null, 2),
		{
			encoding: "utf8",
		},
	);

	if (MISSING_GEAR.cameras.length !== 0 || MISSING_GEAR.lenses.length !== 0) {
		console.log(`
Missing gear clean names:`);
		console.dir(MISSING_GEAR);
	}
});
