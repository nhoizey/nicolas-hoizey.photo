const timestamp = new Date();

module.exports = {
  env: process.env.NODE_ENV,
  service: process.env.SERVICE || 'Cloudflare',
  timestamp: timestamp,
  id: timestamp.valueOf(),
};
