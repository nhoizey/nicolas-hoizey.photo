#!/usr/bin/env node

const exifr = require('exifr');
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

let exifrOptions = {
  ifd0: { pick: ['Make', 'Model'] },
  exif: {
    pick: [
      'DateTimeOriginal',
      'OffsetTime',
      'ExposureTime',
      'ISO',
      'FNumber',
      'FocalLength',
      'FocalLengthIn35mmFormat',
      'ImageDescription',

      'LensModel',
    ],
  },
  gps: { pick: ['latitude', 'longitude'] },
  iptc: { pick: ['ObjectName', 'Keywords'] },
};

fs.readdirSync(SRC).forEach(async (photo) => {
  const srcPhoto = path.join(SRC, photo);
  const photoYFM = {};

  const exifData = await exifr.parse(srcPhoto, exifrOptions);
  const ext = path.extname(srcPhoto);

  console.log(`
${photo}`);
  console.dir(exifData.DigitalCreationTime);
  console.dir(exifData.CreationTime);
  if (photo.match(/Stairz/)) {
    console.dir(exifData);
  }

  if (undefined === exifData) {
    console.error(`  ⚠ error reading EXIF data for ${photo}`);
  } else if (undefined === exifData.ObjectName) {
    console.error(`  ⚠ ObjectName property missing for ${photo}`);
  } else {
    // get title
    photoYFM.title = utf8.decode(exifData.ObjectName);
    console.log(`
### ${photoYFM.title}`);

    // get description
    let photoDescription = '';
    if (exifData.Caption) {
      photoDescription = utf8.decode(exifData.Caption).trim();
    }

    // get photo date
    if (exifData.DateTimeOriginal && exifData.OffsetTime) {
      const gmt = exifData.DateTimeOriginal.toGMTString();
      const tz = exifData.OffsetTime;
      photoYFM.date = moment
        .utc(gmt)
        .utcOffset(tz)
        .format('YYYY-MM-DD HH:MM:SS Z');
    } else if (exifData.DigitalCreationDate && exifData.DigitalCreationTime) {
      photoYFM.date = `${exifData.DigitalCreationDate.replace(
        /([0-9]{4})([0-9]{2})([0-9]{2})/,
        '$1-$2-$3'
      )}`;
    } else {
      console.error(`  ⚠ date missing for ${photo}`);
      photoYFM.date = photo.slice(0, 10);
    }
    console.log(`   ${photoYFM.date}`);

    let make = '';
    if (exifData.Make) {
      // Simpler make
      make = exifData.Make.replace('Konica Corporation', 'Konica').replace(
        'FUJI PHOTO FILM CO., LTD.',
        'Fujifilm'
      );
    }

    let model = '';
    if (exifData.Model) {
      // Simpler model
      model = exifData.Model.replace('Konica Digital Camera ', '').replace(
        'Canon EOS 5D Mark II',
        'EOS 5D Mark II'
      );
    }

    const keywords = exifData.Keywords.map((keyword) => utf8.decode(keyword))
      .sort((a, b) => a.localeCompare(b, 'en'))
      .join(', ');

    let exposureTimeFraction = '';
    // Add exposure time as a fraction
    if (exifData.ExposureTime) {
      let t = new Fraction(exifData.ExposureTime);
      exposureTimeFraction = t.toFraction(true);
    }

    // Get image dimensions
    let imageDimensions = imageSize(srcPhoto);

    // Manage folder and file
    const slug = slugify(photoYFM.title);
    const distDir = path.join(DIST, slug);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }
    const distPhoto = path.join(distDir, `${slug}${ext}`);
    fs.copyFileSync(srcPhoto, distPhoto);

    // Manage index file
    let mdContent = `---
${YAML.stringify(photoYFM)}
dimensions:
  width: ${imageDimensions.width}
  height: ${imageDimensions.height}
gear:${
      make
        ? `
  make: ${make}`
        : ''
    }${
      model
        ? `
  model: ${model}`
        : ''
    }${
      exifData.LensModel
        ? `
  lens: ${exifData.LensModel}`
        : ''
    }
settings:
  focal_length: ${exifData.FocalLength}${
      exifData.FocalLengthIn35mmFormat
        ? `
  focal_length_35mm: ${exifData.FocalLengthIn35mmFormat}`
        : ''
    }
  iso: ${exifData.ISO}
  aperture: ${exifData.FNumber}
  exposition: ${exposureTimeFraction}
  exposure_time: ${exifData.ExposureTime}
  exposure_time_fraction: ${exposureTimeFraction}
geo:
  latitude: ${exifData.latitude}
  longitude: ${exifData.longitude}
tags: [${keywords}]
---

${photoDescription}
`;

    fs.writeFileSync(path.join(distDir, 'index.md'), mdContent);
  }
});
