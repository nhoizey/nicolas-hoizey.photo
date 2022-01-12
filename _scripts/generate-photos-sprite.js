#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate sprite from thumbnails
execSync(
  'npx mbsprite bundle src/ui/thumbnails _temp/thumbnails/icons _temp/thumbnails/icons@2x'
);

// optimize sprites
const src = 'src/ui/thumbnails/sprite.png';
const tmp = 'src/ui/thumbnails/sprite_temp.png';
sharp(src)
  .png({ colors: 100 })
  .toFile(tmp, function (err) {
    if (err) {
      console.error(`Error while creating sprite`, err);
    }
    fs.renameSync(tmp, src);
  });

const src2 = 'src/ui/thumbnails/sprite@2x.png';
const tmp2 = 'src/ui/thumbnails/sprite@2x_temp.png';
sharp(src2)
  .png({ colors: 100 })
  .toFile(tmp2, function (err) {
    if (err) {
      console.error(`Error while creating @2x sprite`, err);
    }
    fs.renameSync(tmp2, src2);
  });
