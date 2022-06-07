const fs = require('fs');
const path = require('path');

module.exports = {
  dirname: (filePath) => {
    return path.dirname(filePath);
  },
  exists: (filePath) => {
    return fs.existsSync(filePath);
  },
};
