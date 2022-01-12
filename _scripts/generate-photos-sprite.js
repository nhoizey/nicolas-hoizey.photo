#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate sprite from thumbnails
execSync(
  'npx mbsprite bundle src/ui/thumbnails _temp/thumbnails/icons _temp/thumbnails/icons@2x'
);

let spritesWeight = 0;
const spritesWeightFile = 'src/_data/sprites.json';

// optimize sprites
const src = 'src/ui/thumbnails/sprite.png';
const tmp = 'src/ui/thumbnails/sprite_temp.png';

const promise1 = sharp(src)
  .png({ colors: 200 })
  .toFile(tmp)
  .then((info) => {
    if (info?.size) {
      spritesWeight += info.size;
    }
    fs.renameSync(tmp, src);
  })
  .catch((err) => {
    console.error(`Error while creating sprite`, err);
  });

const src2 = 'src/ui/thumbnails/sprite@2x.png';
const tmp2 = 'src/ui/thumbnails/sprite@2x_temp.png';

const promise2 = sharp(src2)
  .png({ colors: 200 })
  .toFile(tmp2)
  .then((info) => {
    if (info?.size) {
      spritesWeight += info.size;
    }
    fs.renameSync(tmp2, src2);
  })
  .catch((err) => console.error(`Error while creating @2x sprite`, err));

Promise.all([promise1, promise2]).then(() => {
  if (spritesWeight > 0) {
    // Considering file size is a good enough hash for cache busting
    fs.writeFileSync(
      spritesWeightFile,
      JSON.stringify({ signature: spritesWeight }),
      {
        encoding: 'utf8',
      }
    );
    console.log('Done!');
  }
});
