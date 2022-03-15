const axios = require('axios');

exports.handler = async () => {
  const headers = {
    'X-Auth-Email': `${process.env.CLOUDFLARE_EMAIL}`,
    Authorization: `Bearer ${process.env.CLOUDFLARE_PURGE_KEY}`,
    'Content-Type': 'application/json',
  };

  const callbackHeaders = {
    'Content-Type': 'application/vnd.api+json; charset=utf=8',
  };

  const CLOUDFLARE_API = `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`;

  axios
    .post(CLOUDFLARE_API, '{ "purge_everything": true }', {
      headers: headers,
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
