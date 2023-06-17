require('dotenv').config();

const fs = require('fs');
const path = require('path');
const slugify = require('../src/_11ty/_utils/slugify.js');
const flickrSdk = require('flickr-sdk');

const PLATFORMS_FILE = 'src/_data/platforms.json';
let platformsData = require(path.join('..', PLATFORMS_FILE));

const syncFlickr = async () => {
  let flickrIds = {};
  for (const slug in platformsData) {
    if (platformsData[slug].flickr) {
      flickrIds[platformsData[slug].flickr.id] = slug;
    }
  }

  const flickr = new flickrSdk(process.env.FLICKR_CONSUMER_KEY);
  let flickrPhotos = await flickr.people
    .getPublicPhotos({
      user_id: process.env.FLICKR_USER_ID,
      extras: 'count_faves',
      per_page: 500,
    })
    .then((res) => res.body.photos.photo);
  flickrPhotos.forEach((photo) => {
    const favs = parseInt(photo.count_faves, 10);
    if (flickrIds.hasOwnProperty(photo.id)) {
      platformsData[flickrIds[photo.id]].flickr.favs = favs;
    } else {
      const flickrSlug = slugify(photo.title);
      if (platformsData.hasOwnProperty(flickrSlug)) {
        platformsData[flickrSlug].flickr = {
          id: photo.id,
          favs: favs,
        };
      } else {
        if (fs.existsSync(`./src/photos/${flickrSlug}`)) {
          platformsData[flickrSlug] = {
            flickr: {
              id: photo.id,
              favs: favs,
            },
          };
        } else {
          console.log(
            `Couldn't find Flickr photo "${photo.title}" here (slug "${flickrSlug}")
-> https://www.flickr.com/photos/nicolas-hoizey/${photo.id}
`
          );
        }
      }
    }
  });
};

syncFlickr().then(() => {
  // Todo after everything else
  fs.writeFileSync(
    path.join('.', PLATFORMS_FILE),
    JSON.stringify(platformsData, null, 2),
    {
      encoding: 'utf8',
    }
  );
});
