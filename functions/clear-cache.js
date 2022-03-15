const axios = require('axios');

exports.handler = (event, context, callback) => {
  const headers = {
    'X-Auth-Email': `${process.env.CF_EMAIL}`,
    Authorization: `Bearer ${process.env.CF_PURGE_KEY}`,
    'Content-Type': 'application/json',
  };

  const callbackHeaders = {
    'Content-Type': 'application/vnd.api+json; charset=utf=8',
  };

  let url = `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`;
  let data = '{ "purge_everything": true }';

  if (event.headers['x-netlify-event']) {
    axios
      .post(url, data, {
        headers: headers,
      })
      .then((res) => {
        callback(null, {
          statusCode: 200,
          headers: callbackHeaders,
          body: JSON.stringify(res.data),
        });
      })
      .catch((err) => {
        callback(null, {
          statusCode: 500,
          headers: callbackHeaders,
          body: JSON.stringify(err.message),
        });
      });
  } else {
    // TO-DO, for non-Netlify triggers
    // may just ignore
  }
};
