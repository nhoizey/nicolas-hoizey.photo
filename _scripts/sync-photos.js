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
};

fs.readdirSync(SRC).forEach(async (photo) => {
  const photoPath = path.join(SRC, photo);
  const ext = path.extname(photoPath);
  if (ext !== '.jpg') {
    return;
  }
  const photoYFM = {};
  const photoExif = await exifr.parse(photoPath, exifrOptions);
  const photoIptc = await exifr.parse(photoPath, {
    ifd0: false,
    ifd1: false,
    exif: false,
    gps: false,
    iptc: true,
  });

  console.log(`
${photo}`);

  if (undefined === photoExif) {
    console.error(`⚠ error reading EXIF data for ${photo}`);
  } else {
    if (undefined === photoIptc.ObjectName) {
      console.error('  ⚠ "iptc.ObjectName" missing');
      photoYFM.title = photo.replace(/[-0-9]+ (.*)\.[^.]+$/, '$1');
    } else {
      // Get title
      photoYFM.title = utf8.decode(photoIptc.ObjectName);
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
      console.error('  ⚠ exif.DateTimeOriginal missing');
      if (photoIptc.DigitalCreationDate && photoIptc.DigitalCreationTime) {
        photoYFM.date = `${photoIptc.DigitalCreationDate.replace(
          /([0-9]{4})([0-9]{2})([0-9]{2})/,
          '$1-$2-$3'
        )} ${photoIptc.DigitalCreationTime.replace(
          /([0-9]{2})([0-9]{2})([0-9]{2})([-+][0-9]{2})([0-9]{2})/,
          '$1:$2:$3 $4:$5'
        )}`;
      } else {
        console.error('  ⚠ iptc.DigitalCreationDate missing');
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

    if (photoIptc.Keywords) {
      photoYFM.tags = photoIptc.Keywords.map((keyword) => utf8.decode(keyword))
        .sort((a, b) => a.localeCompare(b, 'en'))
        .join(', ');
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
        photoYFM.settings.exposure_time = t.toFraction(true);
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
    if (photoIptc.Country) {
      photoYFM.geo.country = utf8.decode(photoIptc.Country);
    }
    if (photoIptc.City) {
      photoYFM.geo.city = utf8.decode(photoIptc.City);
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
  }
});
