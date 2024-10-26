import fs from 'node:fs';
import path from 'node:path';

// save in cache file
export const writeToCache = (data, file) => {
	const dir = path.dirname(file);
	const fileContent = JSON.stringify(data, null, 2);
	// create cache folder if it doesnt exist already
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	// write data to cache json file
	fs.writeFile(file, fileContent, (err) => {
		if (err) throw err;
	});
};

// get cache contents from json file
export const readFromCache = (file) => {
	if (fs.existsSync(file)) {
		const cacheFile = fs.readFileSync(file);
		return JSON.parse(cacheFile);
	}

	// no cache found.
	return false;
};
