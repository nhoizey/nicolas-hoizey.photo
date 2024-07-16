const fs = require('fs');
const path = require('node:path');
const config = require('../../../pack11ty.config.js');

const folders = [];

const getFolders = () => {
  fs.readdirSync(path.join(config.dir.src, 'collections'), {
		encoding: 'utf8',
		withFileTypes: true,
	}).forEach((item) => {
		if (
			item.name !== 'photos' &&
			item.isDirectory() &&
			!item.name.match(/^_/)
		) {
			folders.push(item.name);
		}
	});
};

if (folders.length === 0) {
  getFolders();
}

module.exports = folders;
