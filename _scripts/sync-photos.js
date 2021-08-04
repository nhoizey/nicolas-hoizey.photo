#!/usr/bin/env node

const exifr = require('exifr');
const sharp = require('sharp');
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

let geojsonFeatures = {
  type: 'FeatureCollection',
  features: [],
};

async function syncOnePhoto(photo) {
  const photoPath = path.join(SRC, photo);
  const ext = path.extname(photoPath);
  if (ext !== '.jpg') {
    return;
  }
  const photoYFM = {};
  const photoExif = await exifr.parse(photoPath, exifrOptions);

  if (undefined === photoExif) {
    console.error(`⚠ error reading EXIF data for ${photo}`);
  } else {
    if (undefined === photoExif.ObjectName) {
      console.error(`⚠ "iptc.ObjectName" missing in ${photo}`);
      photoYFM.title = photo.replace(/[-0-9]+ (.*)\.[^.]+$/, '$1');
    } else {
      // Get title
      photoYFM.title = utf8.decode(photoExif.ObjectName);
    }

    // Get description
    let photoDescription = '';
    if (photoExif.ImageDescription) {
      photoDescription = photoExif.ImageDescription.trim();
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
      console.error(`⚠ exif.DateTimeOriginal missing in ${photo}`);
      if (photoExif.DigitalCreationDate && photoExif.DigitalCreationTime) {
        photoYFM.date = `${photoExif.DigitalCreationDate.replace(
          /([0-9]{4})([0-9]{2})([0-9]{2})/,
          '$1-$2-$3'
        )} ${photoExif.DigitalCreationTime.replace(
          /([0-9]{2})([0-9]{2})([0-9]{2})([-+][0-9]{2})([0-9]{2})/,
          '$1:$2:$3 $4:$5'
        )}`;
      } else {
        console.error(`⚠ iptc.DigitalCreationDate missing in ${photo}`);
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
    const dimensions = imageSize(photoPath);
    photoYFM.dimensions = {
      width: dimensions.width,
      height: dimensions.height,
    };

    // Get coordinates
    photoYFM.geo = {};
    if (photoExif.latitude) {
      photoYFM.geo.latitude = photoExif.latitude;
    }
    if (photoExif.longitude) {
      photoYFM.geo.longitude = photoExif.longitude;
    }
    if (photoExif.Country) {
      photoYFM.geo.country = utf8.decode(photoExif.Country);
    }
    if (photoExif.City) {
      photoYFM.geo.city = utf8.decode(photoExif.City);
    }

    // Manage folder and file
    const slug = slugify(photoYFM.title);
    photoYFM.file = `${slug}${ext}`;
    const distDir = path.join(DIST, slug);
    const distPhoto = path.join(distDir, `${slug}${ext}`);

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

    // Generate thumbnails for 1x screens
    const mask = Buffer.from(
      '<svg><circle cx="15" cy="15" r="14" fill="black"/></svg>'
    );
    const border = Buffer.from(
      '<svg><circle cx="15" cy="15" r="14" fill="none" stroke="rebeccapurple" stroke-width="2" /></svg>'
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
      .toFile(path.join(THUMBNAILS, 'icons', `${slug}.png`), function (err) {
        if (err) {
          console.error(`Error while creating thumbnail for ${slug}`, err);
        }
      });

    // Generate thumbnails for 1x screens
    const mask2x = Buffer.from(
      '<svg><circle cx="30" cy="30" r="28" fill="black"/></svg>'
    );
    const border2 = Buffer.from(
      '<svg><circle cx="30" cy="30" r="28" fill="none" stroke="rebeccapurple" stroke-width="3" /></svg>'
    );
    const thumb2File = path.join(THUMBNAILS, 'icons@2x', `${slug}.png`);
    sharp(photoPath)
      .resize(60, 60, {
        fit: sharp.fit.cover,
        position: sharp.strategy.cover,
        position: sharp.strategy.entropy,
        // background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .composite([
        { input: mask2x, left: 0, top: 0, blend: 'dest-in' },
        { input: border2, left: 0, top: 0, blend: 'over' },
      ])
      .toFile(thumb2File, function (err) {
        if (err) {
          console.error(`Error while creating @2x thumbnail for ${slug}`, err);
        } else {
          // Copy as icon for KML
          fs.copyFileSync(thumb2File, path.join(distDir, 'kml.png'));
        }
      });

    // Generate icon for KML
    // https://github.com/lovell/sharp/issues/2819#issuecomment-891077462
    // const firstStep = await sharp(photoPath)
    //   .resize(320, 320, {
    //     fit: sharp.fit.inside,
    //   })
    //   .extend({ top: 1, bottom: 1, left: 1, right: 1, background: 'black' })
    //   .toBuffer();

    // sharp(firstStep)
    //   .extend({ top: 2, bottom: 2, left: 2, right: 2, background: 'white' })
    //   .toFile(path.join(distDir, 'kml.jpg'), function (err) {
    //     if (err) {
    //       console.error(`Error while creating KML icon for ${slug}`, err);
    //     }
    //   });

    // Add photo to geojson file
    // if (photoYFM.geo.latitude && photoYFM.geo.longitude) {
    //   geojsonFeatures.features.push({
    //     type: 'Feature',
    //     geometry: {
    //       type: 'Point',
    //       coordinates: [photoYFM.geo.longitude, photoYFM.geo.latitude],
    //     },
    //     properties: {
    //       title: photoYFM.title,
    //     },
    //   });
    // }
  }
}

const allPromises = [];
fs.readdirSync(SRC).forEach(async (photo) => {
  allPromises.push(syncOnePhoto(photo));
});
Promise.all(allPromises).then(() => {
  // if (geojsonFeatures.features.length > 0) {
  //   fs.writeFileSync('./src/photos.geojson', JSON.stringify(geojsonFeatures));
  // }
});
