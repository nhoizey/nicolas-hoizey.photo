require('dotenv').config();

const fs = require('fs');
const path = require('path');
const slugify = require('../src/_11ty/_utils/slugify.js');
const { login } = require('masto');

const PLATFORMS_FILE = 'src/_data/platforms.json';
let platformsData = require(path.join('..', PLATFORMS_FILE));

const STATUSES_PER_API_CALL = 20;

const syncPixelfed = async () => {
  let pixelfedIds = {};
  for (const slug in platformsData) {
    if (platformsData[slug].pixelfed) {
      if (platformsData[slug].pixelfed.id) {
        pixelfedIds[platformsData[slug].pixelfed.id] = slug;
      } else {
        if (Array.isArray(platformsData[slug].pixelfed)) {
          platformsData[slug].pixelfed.forEach(
            (item) => (pixelfedIds[item.id] = slug)
          );
          platformsData[slug].pixelfed = [];
        }
      }
    }
  }

  // console.dir(pixelfedIds);

  const pixelfedClient = await login({
    url: process.env.PIXELFED_URL,
    accessToken: process.env.PIXELFED_TOKEN,
    disableVersionCheck: true,
  });

  const me = await pixelfedClient.accounts.verifyCredentials();

  let lastCallLength = -1;
  let statusesIndex = 0;
  let lastId = null;

  while (lastCallLength !== 0) {
    const options = {
      only_media: true,
      exclude_replies: true,
      exclude_reblogs: true,
      limit: STATUSES_PER_API_CALL,
    };
    if (lastId) {
      options.max_id = lastId;
    }

    const pixelfedPhotos = await pixelfedClient.accounts.fetchStatuses(
      me.id,
      options
    );

    lastCallLength = pixelfedPhotos.value.length;

    if (lastCallLength !== 0) {
      statusesIndex += lastCallLength;

      for (const photo of pixelfedPhotos.value) {
        // console.log(photo.url);
        lastId = photo.id;

        const faves = parseInt(photo.favouritesCount, 10);
        const reblogs = parseInt(photo.reblogsCount, 10);

        if (pixelfedIds.hasOwnProperty(photo.id)) {
          platformsData[pixelfedIds[photo.id]].pixelfed.push({
            id: photo.id,
            faves: faves,
            reblogs: reblogs,
          });
          // if (platformsData[pixelfedIds[photo.id]].pixelfed.length > 1) {
          //   console.log(
          //     `${
          //       platformsData[pixelfedIds[photo.id]].pixelfed.length
          //     } posts for "${pixelfedIds[photo.id]}"`
          //   );
          // }
        } else {
          const titleRegex = /^["“”]([^"“”]+)["“”](.|\n)*$/m;
          const matches = photo.content.match(titleRegex);
          if (matches) {
            const title = matches[1];
            const pixelfedSlug = slugify(title);
            if (platformsData.hasOwnProperty(pixelfedSlug)) {
              platformsData[pixelfedSlug].pixelfed = [
                {
                  id: photo.id,
                  faves: faves,
                  reblogs: reblogs,
                },
              ];
            } else {
              if (fs.existsSync(`./src/photos/${pixelfedSlug}`)) {
                platformsData[pixelfedSlug] = {
                  pixelfed: [
                    {
                      id: photo.id,
                      faves: faves,
                      reblogs: reblogs,
                    },
                  ],
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
      // console.log(statusesIndex);
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
