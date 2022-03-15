const fetch = require('node-fetch');

exports.handler = async () =>
  fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      body: JSON.stringify({ purge_everything: true }),
      headers: {
        'X-Auth-Email': `${process.env.CLOUDFLARE_EMAIL}`,
        Authorization: `Bearer ${process.env.CLOUDFLARE_PURGE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
    .then((res) => {
      if (res.ok) {
        return res;
      } else {
        throw new Error(
          `The HTTP status of the reponse: ${res.status} (${res.statusText})`
        );
      }
    })
    .then((res) => {
      return res.json().then((json) => {
        return {
          statusCode: 200,
          body: JSON.stringify(json),
        };
      });
    })
    .catch((err) => {
      return {
        statusCode: 500,
        body: `Error: ${JSON.stringify(err)}`,
      };
    });
