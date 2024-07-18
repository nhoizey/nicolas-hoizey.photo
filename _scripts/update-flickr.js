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
      extras: 'count_views,count_faves,count_comments',
      per_page: 500,
    })
    .then((res) => res.body.photos.photo);
  flickrPhotos.forEach((photo) => {
    // console.dir(photo);

    const views = parseInt(photo.count_views, 10);
    const faves = parseInt(photo.count_faves, 10);
    const comments = parseInt(photo.count_comments, 10);

    if (flickrIds.hasOwnProperty(photo.id)) {
      platformsData[flickrIds[photo.id]].flickr.views = views;
      platformsData[flickrIds[photo.id]].flickr.faves = faves;
      platformsData[flickrIds[photo.id]].flickr.comments = comments;
    } else {
      const flickrSlug = slugify(photo.title);
      if (platformsData.hasOwnProperty(flickrSlug)) {
        platformsData[flickrSlug].flickr = {
          id: photo.id,
          views: views,
          faves: faves,
          comments: comments,
        };
      } else {
        if (fs.existsSync(`./src/collections/photos/${flickrSlug}`)) {
					platformsData[flickrSlug] = {
						flickr: {
							id: photo.id,
							views: views,
							faves: faves,
							comments: comments,
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
