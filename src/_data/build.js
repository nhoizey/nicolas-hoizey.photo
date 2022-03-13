const timestamp = new Date();

module.exports = {
  env: process.env.NODE_ENV,
  service: process.env.SERVICE || 'local',
  timestamp: timestamp,
  id: timestamp.valueOf(),
};
