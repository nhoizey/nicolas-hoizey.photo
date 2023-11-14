#!/usr/bin/env node

require('dotenv').config();

const exifr = require('exifr');
const sharp = require('sharp');
const vibrant = require('node-vibrant');
const slugify = require('../src/_11ty/_utils/slugify.js');
const { DateTime } = require('luxon');
const Fraction = require('fraction.js');
const imageSize = require('image-size');
const utf8 = require('utf8');
const YAML = require('yaml');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const fs = require('fs');
const path = require('path');

const SRC =
  '/Users/nicolashoizey/Synology/Personnel/Photographie/nicolas-hoizey.photo/';
const DIST = './src/photos/';
const THUMBNAILS = './_temp/thumbnails/';
const DIFFS = path.join(SRC, '_temp_diffs');
const SMALL_VERSION_PIXELS = 900 * 600;

const CLEAN_GEAR = require('../src/_data/gear.json');
const MISSING_GEAR = { cameras: [], lenses: [] };

let photosData = require('../_cache/photos-data.json');

// Create folders for thumbnails
if (!fs.existsSync(path.join(THUMBNAILS, 'icons'))) {
  fs.mkdirSync(path.join(THUMBNAILS, 'icons'));
}
if (!fs.existsSync(path.join(THUMBNAILS, 'icons@2x'))) {
  fs.mkdirSync(path.join(THUMBNAILS, 'icons@2x'));
}

let exifrOptions = {
  ifd0: {
    pick: ['Make', 'Model', 'ImageDescription'],
  },
  exif: {
    pick: [
      'DateTimeOriginal',
      'OffsetTime',
      'ExposureTime',
      'ISO',
      'FNumber',
      'FocalLength',
      'FocalLengthIn35mmFormat',
      'LensModel',
    ],
  },
  gps: {
    pick: ['latitude', 'longitude'],
  },
  iptc: true,
  // xmp: { pick: ['Headline'] },
  userComment: true,
};

async function syncOnePhoto(photo) {
  if (photo === '.DS_Store') return;

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
  if (ext !== '.jpg') {
    return;
  }
  let photoYFM = {};
  const photoExif = await exifr.parse(photoPath, exifrOptions);

  if (undefined === photoExif) {
    thisLog(`  ⚠ error reading EXIF data`);
  } else {
    if (undefined === photosData[photo]) {
      photosData[photo] = {};
    }

    let copyPhotoFile = false;
    if (JSON.stringify(photosData[photo].raw) !== JSON.stringify(photoExif)) {
      thisLog(`  ⚠ EXIF data are new or changed`);
      photosData[photo].raw = photoExif;
      copyPhotoFile = true;
    }

    if (undefined === photoExif.ObjectName) {
      thisLog(`  ⚠ "iptc.ObjectName" missing`);
      photoYFM.title = photo.replace(/[-0-9]+ (.*)\.[^.]+$/, '$1');
    } else {
      // Get title
      photoYFM.title = utf8.decode(photoExif.ObjectName);
    }

    // Compute folder and file paths from title
    const slug = slugify(photoYFM.title);
    photoYFM.file = `${slug}${ext}`;
    const distDir = path.join(DIST, slug);
    const distPhoto = path.join(distDir, `${slug}${ext}`);

    // Get description for alt text from IPTC's userComment or Headline
    // TODO: remove support for Headline
    let photoAltText = '';
    if (photoExif.userComment) {
      photoAltText = Object.values(photoExif.userComment)
        .map((char) => String.fromCharCode(char))
        .join('')
        .replace('ASCII\0\0\0', '');
    } else if (photoExif.Headline) {
      photoAltText = utf8.decode(photoExif.Headline).trim();
    }
    if (photoAltText.length === 0) {
      thisLog(
        `  ⚠ alt text missing: userComment or Headline ("Gros titre" in French) field in Lightroom`
      );
    } else {
      photoYFM.alt_text = photoAltText;
    }

    // Get caption/description
    let photoDescription = '';
    if (photoExif.ImageDescription) {
      photoDescription = photoExif.ImageDescription.trim();
    }
    if (photoDescription.length === 0) {
      thisLog(`  ⚠ description missing`);
    }

    // get photo date
    let luxonDate;
    if (photoExif.DateTimeOriginal && photoExif.OffsetTime) {
      luxonDate = DateTime.fromHTTP(
        photoExif.DateTimeOriginal.toGMTString()
      ).setZone('UTC+' + parseInt(photoExif.OffsetTime, 10));
    } else {
      thisLog(`  ⚠ exif.DateTimeOriginal missing`);
      if (photoExif.DigitalCreationDate && photoExif.DigitalCreationTime) {
        luxonDate = DateTime.fromFormat(
          `${photoExif.DigitalCreationDate} ${photoExif.DigitalCreationTime}`,
          'yyyyLLdd HHmmssZZZ'
        );
      } else {
        thisLog(`  ⚠ iptc.DigitalCreationDate`);
        luxonDate = DateTime.fromFormat(
          `${photo.slice(0, 10)} 12:00:00 Z`,
          'yyyy-LL-dd HH:mm:ss Z'
        );
      }
    }
    photoYFM.date = luxonDate.toFormat('yyyy-LL-dd HH:mm:ss ZZ');

    photoYFM.dates = {
      iso: luxonDate.toFormat('yyyy-LL-dd'),
      human: luxonDate.toFormat('d LLLL yyyy'),
    };

    if (photoExif.Model || photoExif.LensModel) {
      // Get gear
      photoYFM.gear = { short: '' };
      if (photoExif.Make || photoExif.Model) {
        const makeAndModel = `${photoExif.Make || ''} ${photoExif.Model || ''}`;
        if (CLEAN_GEAR.cameras[makeAndModel] === undefined) {
          if (!MISSING_GEAR.cameras.includes(makeAndModel)) {
            MISSING_GEAR.cameras.push(makeAndModel);
          }
          photoYFM.gear.camera = {
            brand: photoExif.Make || 'unknown',
            model: photoExif.Model || 'unknown',
          };
          photoYFM.gear.short = [
            photoExif.Make || '',
            photoExif.Model || '',
          ].join(' ');
        } else {
          photoYFM.gear.camera = CLEAN_GEAR.cameras[makeAndModel];
          photoYFM.gear.short = [
            CLEAN_GEAR.cameras[makeAndModel].brand || '',
            CLEAN_GEAR.cameras[makeAndModel].short ||
              CLEAN_GEAR.cameras[makeAndModel].model ||
              '',
          ].join(' ');
        }
      } else {
        thisLog(`  ⚠ exif.Model missing`);
      }

      if (photoExif.LensModel) {
        if (CLEAN_GEAR.lenses[photoExif.LensModel] === undefined) {
          if (!MISSING_GEAR.lenses.includes(photoExif.LensModel)) {
            MISSING_GEAR.lenses.push(photoExif.LensModel);
          }
          photoYFM.gear.lenses = [
            {
              brand: 'unknown',
              model: photoExif.LensModel,
            },
          ];
          photoYFM.gear.short += ` + ${photoExif.LensModel}`;
        } else {
          if (CLEAN_GEAR.lenses[photoExif.LensModel] !== false) {
            if (Array.isArray(CLEAN_GEAR.lenses[photoExif.LensModel])) {
              photoYFM.gear.lenses = CLEAN_GEAR.lenses[photoExif.LensModel];
            } else {
              photoYFM.gear.lenses = [CLEAN_GEAR.lenses[photoExif.LensModel]];
            }
            photoYFM.gear.lenses.forEach((lens) => {
              photoYFM.gear.short += ` + ${
                lens.brand !== (photoYFM.gear.camera.brand || '')
                  ? `${lens.brand}`
                  : ''
              }${lens.short || lens.model || ''}`;
            });
          }
        }
      } else {
        thisLog(`  ⚠ exif.LensModel missing`);
      }
    }

    if (photoExif.Keywords) {
      photoYFM.tags = photoExif.Keywords.map((keyword) =>
        utf8.decode(keyword)
      ).sort((a, b) => a.localeCompare(b, 'en'));
    }

    if (
      photoExif.FocalLength ||
      photoExif.FocalLengthIn35mmFormat ||
      photoExif.ISO ||
      photoExif.FNumber ||
      photoExif.ExposureTime
    ) {
      photoYFM.settings = {};

      // Focal length
      if (photoExif.FocalLength || photoExif.FocalLengthIn35mmFormat) {
        photoYFM.settings.focal_length = {};
        if (photoExif.FocalLength) {
          photoYFM.settings.focal_length.raw = photoExif.FocalLength;
        }

        if (photoExif.FocalLengthIn35mmFormat) {
          photoYFM.settings.focal_length.eq35mm =
            photoExif.FocalLengthIn35mmFormat;
        }

        photoYFM.settings.focal_length.computed =
          photoYFM.settings.focal_length.eq35mm ||
          photoYFM.settings.focal_length.raw;

        photoYFM.settings.focal_length.readable = `${photoYFM.settings.focal_length.computed} mm`;

        photoYFM.settings.focal_length.slug = slugify(
          photoYFM.settings.focal_length.readable
        );
      }

      if (photoExif.ISO) {
        photoYFM.settings.iso = {
          raw: photoExif.ISO,
          computed: photoExif.ISO,
          readable: `${photoExif.ISO}`,
          slug: slugify(`${photoExif.ISO}`),
        };
      }

      if (photoExif.FNumber) {
        photoYFM.settings.aperture = {
          raw: photoExif.FNumber,
          computed: photoExif.FNumber,
          readable: `ƒ/${photoExif.FNumber}`,
          slug: slugify(`f/${photoExif.FNumber}`),
        };
      }

      if (photoExif.ExposureTime) {
        photoYFM.settings.shutter_speed = {
          raw: photoExif.ExposureTime,
          computed: photoExif.ExposureTime,
        };

        // Add exposure time as a fraction for readability
        let t = new Fraction(photoExif.ExposureTime);

        photoYFM.settings.shutter_speed.readable = `${t.toFraction(true)} s`;

        photoYFM.settings.shutter_speed.slug = slugify(
          photoYFM.settings.shutter_speed.readable
        );
      }
    }

    // Get image dimensions
    if (photosData[photo].dimensions) {
      photoYFM.dimensions = photosData[photo].dimensions;
    } else {
      const dimensions = imageSize(photoPath);
      photoYFM.dimensions = {
        width: dimensions.width,
        height: dimensions.height,
      };
      photosData[photo].dimensions = photoYFM.dimensions;
    }

    // Get coordinates
    if (photoExif.latitude && photoExif.longitude) {
      if (
        photoExif.latitude >= parseFloat(process.env.HOME_1_LATITUDE_MIN) &&
        photoExif.latitude <= parseFloat(process.env.HOME_1_LATITUDE_MAX) &&
        photoExif.longitude >= parseFloat(process.env.HOME_1_LONGITUDE_MIN) &&
        photoExif.longitude <= parseFloat(process.env.HOME_1_LONGITUDE_MAX)
      ) {
        thisLog(`  ⚠ Removing position for photo in home 1 area`);
      } else if (
        photoExif.latitude >= parseFloat(process.env.HOME_2_LATITUDE_MIN) &&
        photoExif.latitude <= parseFloat(process.env.HOME_2_LATITUDE_MAX) &&
        photoExif.longitude >= parseFloat(process.env.HOME_2_LONGITUDE_MIN) &&
        photoExif.longitude <= parseFloat(process.env.HOME_2_LONGITUDE_MAX)
      ) {
        thisLog(`  ⚠ Removing position for photo in home 2 area`);
      } else {
        photoYFM.geo = {
          latitude: photoExif.latitude,
          longitude: photoExif.longitude,
        };
        if (photoExif.Country) {
          photoYFM.geo.country = utf8.decode(photoExif.Country);
        }
        if (photoExif.City) {
          photoYFM.geo.city = utf8.decode(photoExif.City);
        }

        // Get map for the photo
        const mapFile = path.join(distDir, 'map.png');
        if (fs.existsSync(mapFile)) {
          photoYFM.geo.map = true;
        } else {
          thisLog(`  ⚠ map image missing`);
        }

        // Generate thumbnails for 1x screens
        const thumbFile = path.join(THUMBNAILS, 'icons', `${slug}.png`);
        if (!fs.existsSync(thumbFile)) {
          const mask = Buffer.from(
            '<svg><circle cx="15" cy="15" r="14" fill="black"/></svg>'
          );
          const border = Buffer.from(
            '<svg><circle cx="15" cy="15" r="14" fill="none" stroke="white" stroke-width="2" /></svg>'
          );
          sharp(photoPath)
            .resize(30, 30, {
              fit: sharp.fit.cover,
              position: sharp.strategy.cover,
              position: sharp.strategy.entropy,
              // background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .composite([
              { input: mask, left: 0, top: 0, blend: 'dest-in' },
              { input: border, left: 0, top: 0, blend: 'over' },
            ])
            .toFile(thumbFile, function (err) {
              if (err) {
                thisLog(`Error while creating thumbnail for ${slug}`, err);
              }
            });
        }

        // Generate thumbnails for 2x screens
        const thumb2File = path.join(THUMBNAILS, 'icons@2x', `${slug}.png`);
        if (!fs.existsSync(thumb2File)) {
          const mask2x = Buffer.from(
            '<svg><circle cx="30" cy="30" r="28" fill="black"/></svg>'
          );
          const border2 = Buffer.from(
            '<svg><circle cx="30" cy="30" r="28" fill="none" stroke="white" stroke-width="3" /></svg>'
          );
          sharp(photoPath)
            .resize(60, 60, {
              fit: sharp.fit.cover,
              position: sharp.strategy.cover,
              position: sharp.strategy.entropy,
            })
            .composite([
              { input: mask2x, left: 0, top: 0, blend: 'dest-in' },
              { input: border2, left: 0, top: 0, blend: 'over' },
            ])
            .toFile(thumb2File, function (err) {
              if (err) {
                thisLog(`Error while creating @2x thumbnail for ${slug}`, err);
              }
            });
        }
      }
    } else {
      thisLog(`  ⚠ geolocation missing`);
    }

    // Check opengraph image for the photo
    const opengraphFile = path.join(distDir, 'opengraph.jpg');
    if (!fs.existsSync(opengraphFile)) {
      thisLog(`  ⚠ opengraph image missing`);
    }

    if (photosData[photo].colors) {
      photoYFM.colors = photosData[photo].colors;
    } else {
      // Get photo dominant color with Vibrant.js
      const palette = await vibrant.from(photoPath).getPalette();
      photoYFM.colors = {
        vibrant: palette.Vibrant.getRgb()
          .map((value) => Math.round(value))
          .join(' '),
        darkVibrant: palette.DarkVibrant.getRgb()
          .map((value) => Math.round(value))
          .join(' '),
        lightVibrant: palette.LightVibrant.getRgb()
          .map((value) => Math.round(value))
          .join(' '),
        muted: palette.Muted.getRgb()
          .map((value) => Math.round(value))
          .join(' '),
        darkMuted: palette.DarkMuted.getRgb()
          .map((value) => Math.round(value))
          .join(' '),
        lightMuted: palette.LightMuted.getRgb()
          .map((value) => Math.round(value))
          .join(' '),
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
      photoYFM.lqip = `data:image/webp;base64,${data.toString('base64')}`;
      photosData[photo].lqip = photoYFM.lqip;
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
            `New photo is not the same dimensions as the old one: ${existingPhotoBuffer.info.width}x${existingPhotoBuffer.info.height} vs ${newPhotoBuffer.info.width}x${newPhotoBuffer.info.height}`
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
            }
          );

          if (diff > 0) {
            thisLog(`${diff} different pixels for ${photoPath}`);

            // Create temporary folder for image diffs if it's missing
            if (!fs.existsSync(path.join(DIFFS))) {
              fs.mkdirSync(path.join(DIFFS));
            }

            fs.writeFileSync(
              path.join(DIFFS, `${slug}${ext}`),
              PNG.sync.write(diffImage)
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
    let mdContent = `---
${YAML.stringify(photoYFM)}---

${photoDescription}
`;

    fs.writeFileSync(path.join(distDir, 'index.md'), mdContent);

    // Generate thumbnail for Atom feed
    const smallVersion = path.join(distDir, 'small.jpg');
    if (!fs.existsSync(smallVersion)) {
      let ratio = photoYFM.dimensions.width / photoYFM.dimensions.height;
      let targetHeight = Math.sqrt(SMALL_VERSION_PIXELS / ratio);
      let targetWidth = ratio * targetHeight;

      sharp(photoPath)
        .resize({
          width: Math.round(targetWidth),
          height: Math.round(targetHeight),
          fit: sharp.fit.inside,
        })
        .jpeg({ quality: 80 })
        .toFile(smallVersion, function (err) {
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
    './_cache/photos-data.json',
    JSON.stringify(photosData, null, 2),
    {
      encoding: 'utf8',
    }
  );

  console.log(`
Missing gear clean names:`);
  console.dir(MISSING_GEAR);
});
