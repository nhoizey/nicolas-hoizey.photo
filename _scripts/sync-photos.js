#!/usr/bin/env node

require('dotenv').config();

const puppeteer = require('puppeteer-core');
const exifr = require('exifr');
const sharp = require('sharp');
const vibrant = require('node-vibrant');
const slugify = require('../src/_11ty/_utils/slugify.js');
const moment = require('moment');
const Fraction = require('fraction.js');
const imageSize = require('image-size');
const utf8 = require('utf8');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const SRC =
  '/Users/nhoizey/Synology/Personnel/Photographie/nicolas-hoizey.photo/';
const DIST = './src/photos/';
const THUMBNAILS = './_temp/thumbnails/';
const FEED_THUMBNAIL_PIXELS = 750 * 500;

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
};

async function syncOnePhoto(photo) {
  if (photo === '.DS_Store') return;

  console.log(`
SYNC ${photo}`);
  const photoPath = path.join(SRC, photo);
  const ext = path.extname(photoPath);
  if (ext !== '.jpg') {
    return;
  }
  const photoYFM = {};
  const photoExif = await exifr.parse(photoPath, exifrOptions);

  if (undefined === photoExif) {
    console.error(`  ⚠ error reading EXIF data`);
  } else {
    if (photosData[photo] === undefined) {
      photosData[photo] = {};
    }

    if (undefined === photoExif.ObjectName) {
      console.error(`  ⚠ "iptc.ObjectName" missing`);
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

    // Get description
    let photoDescription = '';
    if (photoExif.ImageDescription) {
      photoDescription = photoExif.ImageDescription.trim();
    }
    if (photoDescription.length === 0) {
      console.error(`  ⚠ missing description`);
    }

    // get photo date
    if (photoExif.DateTimeOriginal && photoExif.OffsetTime) {
      const gmt = photoExif.DateTimeOriginal.toGMTString();
      const tz = photoExif.OffsetTime;
      photoYFM.date = moment
        .utc(gmt)
        .utcOffset(tz)
        .format('YYYY-MM-DD HH:MM:SS Z');
    } else {
      console.error(`  ⚠ exif.DateTimeOriginal missing`);
      if (photoExif.DigitalCreationDate && photoExif.DigitalCreationTime) {
        photoYFM.date = `${photoExif.DigitalCreationDate.replace(
          /([0-9]{4})([0-9]{2})([0-9]{2})/,
          '$1-$2-$3'
        )} ${photoExif.DigitalCreationTime.replace(
          /([0-9]{2})([0-9]{2})([0-9]{2})([-+][0-9]{2})([0-9]{2})/,
          '$1:$2:$3 $4:$5'
        )}`;
      } else {
        console.error(`  ⚠ iptc.DigitalCreationDate`);
        photoYFM.date = photo.slice(0, 10);
      }
    }

    // Get gear
    photoYFM.gear = {};
    if (photoExif.Make) {
      // Simpler make
      photoYFM.gear.make = photoExif.Make.replace(
        'Konica Corporation',
        'Konica'
      ).replace('FUJI PHOTO FILM CO., LTD.', 'Fujifilm');
    }
    if (photoExif.Model) {
      // Simpler model
      photoYFM.gear.model = photoExif.Model.replace(
        'Konica Digital Camera ',
        ''
      ).replace('Canon EOS 5D Mark II', 'EOS 5D Mark II');
    }
    if (photoExif.LensModel) {
      photoYFM.gear.lens = photoExif.LensModel;
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
      if (photoExif.FocalLength) {
        photoYFM.settings.focal_length = photoExif.FocalLength;
      }
      if (photoExif.FocalLengthIn35mmFormat) {
        photoYFM.settings.focal_length_35mm = photoExif.FocalLengthIn35mmFormat;
      }
      if (photoExif.ISO) {
        photoYFM.settings.iso = photoExif.ISO;
      }
      if (photoExif.FNumber) {
        photoYFM.settings.aperture = photoExif.FNumber;
      }
      if (photoExif.ExposureTime) {
        // Add exposure time as a fraction
        let t = new Fraction(photoExif.ExposureTime);
        photoYFM.settings.shutter_speed = t.toFraction(true);
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
    photoYFM.geo = {};
    if (photoExif.latitude && photoExif.longitude) {
      if (
        Math.abs(photoExif.latitude - process.env.HOME_LATITUDE) < 0.01 &&
        Math.abs(photoExif.longitude - process.env.HOME_LONGITUDE) < 0.01
      ) {
        photoYFM.geo.latitude = 48.692803;
        photoYFM.geo.longitude = 2.422789;
      } else {
        photoYFM.geo.latitude = photoExif.latitude;
        photoYFM.geo.longitude = photoExif.longitude;
      }
      // Get map for the photo
      const mapFile = path.join(distDir, 'map.png');
      if (fs.existsSync(mapFile)) {
        photoYFM.geo.map = true;
      } else {
        const photoUrl = `https://nicolas-hoizey.photo/photos/${slug}/`;
        console.log(`  get map image`);
        const browser = await puppeteer.launch({
          executablePath:
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        });
        const page = await browser.newPage();
        page.setViewport({
          width: 1200,
          height: 800,
          deviceScaleFactor: 1.5,
        });
        await page.goto(photoUrl, { waitUntil: 'load', timeout: 0 });

        // Remove marker and its shadow
        const markerShadow = await page.$('#map .marker-shadow');
        if (markerShadow) {
          await markerShadow.evaluate((node) =>
            node.parentElement.removeChild(node)
          );
        }
        const marker = await page.$('#map .marker');
        if (marker) {
          await marker.evaluate((node) => node.parentElement.removeChild(node));
        }

        // Take a screenshot of the map
        const map = await page.$('#map img');
        if (map) {
          const screenshotResult = await map.screenshot({ path: mapFile });
          if (screenshotResult) {
            photoYFM.geo.map = true;
          }
        }

        await page.close();
        await browser.close();
      }
    } else {
      console.error(`  ⚠ geolocation missing`);
    }
    if (photoExif.Country) {
      photoYFM.geo.country = utf8.decode(photoExif.Country);
    }
    if (photoExif.City) {
      photoYFM.geo.city = utf8.decode(photoExif.City);
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

    // Manage folder and file
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }
    fs.copyFileSync(photoPath, distPhoto);

    // Manage index file
    let mdContent = `---
${YAML.stringify(photoYFM)}---

${photoDescription}
`;

    fs.writeFileSync(path.join(distDir, 'index.md'), mdContent);

    // Generate thumbnail for Atom feed
    const feedThumbnail = path.join(distDir, 'feed.jpg');
    if (!fs.existsSync(feedThumbnail)) {
      let ratio = photoYFM.dimensions.width / photoYFM.dimensions.height;
      let targetHeight = Math.sqrt(FEED_THUMBNAIL_PIXELS / ratio);
      let targetWidth = ratio * targetHeight;

      sharp(photoPath)
        .resize({
          width: Math.round(targetWidth),
          height: Math.round(targetHeight),
          fit: sharp.fit.inside,
        })
        .jpeg({ quality: 80 })
        .toFile(feedThumbnail, function (err) {
          if (err) {
            console.error(
              `Error while creating feed thumbnail for ${slug}`,
              err
            );
          }
        });
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
            console.error(`Error while creating thumbnail for ${slug}`, err);
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
            console.error(
              `Error while creating @2x thumbnail for ${slug}`,
              err
            );
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
  fs.writeFileSync('./_cache/photos-data.json', JSON.stringify(photosData), {
    encoding: 'utf8',
  });
});
