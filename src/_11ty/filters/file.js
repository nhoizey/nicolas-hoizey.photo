// TODO: filtres à supprimer quand dispo dans eleventy-plugin-pack11ty

import fs from 'node:fs';

export const exists = (filePath) => {
	return fs.existsSync(filePath);
};
