require('dotenv').config();

const fs = require('fs');
const path = require('path');
const slugify = require('../src/_11ty/_utils/slugify.js');
const { login } = require('masto');

const PLATFORMS_FILE = 'src/_data/platforms.json';
let platformsData = require(path.join('..', PLATFORMS_FILE));

const syncPixelfed = async () => {
  let pixelfedIds = {};
  for (const slug in platformsData) {
    if (platformsData[slug].pixelfed) {
      pixelfedIds[platformsData[slug].pixelfed.id] = slug;
    }
  }

  const pixelfedClient = await login({
    url: process.env.PIXELFED_URL,
    accessToken: process.env.PIXELFED_TOKEN,
    disableVersionCheck: true,
  });

  const me = await pixelfedClient.accounts.verifyCredentials();
  const pixelfedPhotos = await pixelfedClient.accounts.fetchStatuses(me.id, {
    limit: 100,
  });

  for (const photo of pixelfedPhotos.value) {
    // console.log(photo);

    const faves = parseInt(photo.favouritesCount, 10);
    const reblogs = parseInt(photo.reblogsCount, 10);

    if (pixelfedIds.hasOwnProperty(photo.id)) {
      platformsData[pixelfedIds[photo.id]].pixelfed = {
        id: photo.id,
        faves: faves,
        reblogs: reblogs,
      };
    } else {
      const titleRegex = /^["“”]([^"“”]+)["“”](.|\n)*$/m;
      const matches = photo.content.match(titleRegex);
      if (matches) {
        const title = matches[1];
        const pixelfedSlug = slugify(title);
        if (platformsData.hasOwnProperty(pixelfedSlug)) {
          platformsData[pixelfedSlug].pixelfed = {
            id: photo.id,
            faves: faves,
            reblogs: reblogs,
          };
        } else {
          if (fs.existsSync(`./src/photos/${pixelfedSlug}`)) {
            platformsData[pixelfedSlug] = {
              pixelfed: {
                id: photo.id,
                faves: faves,
                reblogs: reblogs,
              },
            };
          } else {
            console.log(
              `Couldn't find Pixelfed photo titled "${title}" here: ${photo.url}`
            );
          }
        }
      } else {
        console.log(`No title found for ${photo.url}`);
      }
    }
  }
};

syncPixelfed().then(() => {
  // Todo after everything else
  fs.writeFileSync(
    path.join('.', PLATFORMS_FILE),
    JSON.stringify(platformsData, null, 2),
    {
      encoding: 'utf8',
    }
  );
});
