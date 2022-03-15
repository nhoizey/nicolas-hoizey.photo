const axios = require('axios');

const CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`;
const CLOUDFLARE_API_HEADERS = {
  'X-Auth-Email': `${process.env.CLOUDFLARE_EMAIL}`,
  Authorization: `Bearer ${process.env.CLOUDFLARE_PURGE_KEY}`,
  'Content-Type': 'application/json',
};

exports.handler = async () => {
  axios
    .post(CLOUDFLARE_API_URL, '{ "purge_everything": true }', {
      headers: CLOUDFLARE_API_HEADERS,
    })
    .then((res) => {
      return {
        statusCode: 200,
        body: JSON.stringify(res.data),
      };
    })
    .catch((err) => {
      return {
        statusCode: 500,
        body: JSON.stringify(err.message),
      };
    });
};
