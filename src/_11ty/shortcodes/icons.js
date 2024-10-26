import fs from 'node:fs';
import path from 'node:path';

const ICONS_FOLDERS = {
	feather: 'node_modules/feather-icons/dist/icons/',
	majesticons: 'node_modules/majesticons/line/',
	simple: 'node_modules/simple-icons/icons/',
	local: 'src/assets/svg/',
};

const ICONS = {
	animal: { name: 'bug-2-line', source: 'majesticons' },
	blog: { name: 'article-line', source: 'majesticons' },
	date: { name: 'calendar-line', source: 'majesticons' },
	camera: { name: 'camera-line', source: 'majesticons' },
	urban: { name: 'community-line', source: 'majesticons' },
	nature: { name: 'flower-2-line', source: 'majesticons' },
	folder: { name: 'folder-line', source: 'majesticons' },
	travels: { name: 'globe-earth-2-line', source: 'majesticons' },
	like: { name: 'heart-line', source: 'majesticons' },
	home: { name: 'home-line', source: 'majesticons' },
	portraits: { name: 'incognito-line', source: 'majesticons' },
	info: { name: 'info-circle-line', source: 'majesticons' },
	contact: { name: 'mail-line', source: 'majesticons' },
	landscape: { name: 'image-line', source: 'majesticons' },
	map: { name: 'map-simple-marker-line', source: 'majesticons' },
	misc: { name: 'puzzle-line', source: 'majesticons' },
	share: { name: 'share-line', source: 'majesticons' },
	tag: { name: 'tag-line', source: 'majesticons' },
	share: { name: 'share-line', source: 'majesticons' },
	lens: { name: 'telescope-line', source: 'majesticons' },
	shutter_speed: { name: 'timer-line', source: 'majesticons' },
	search: { name: 'search-line', source: 'majesticons' },
	aperture: { name: 'aperture', source: 'feather' },
	statistics: { name: 'pie-chart', source: 'feather' },
	download: { name: 'download', source: 'feather' },
	feeds: { name: 'rss', source: 'feather' },
	mastodon: { name: 'mastodon', source: 'simple' },
};

export const inline_icon = (icon) => {
	const { name, source } = ICONS[icon] || { name: icon, source: 'local' };
	let inlineSvg = fs.readFileSync(
		path.join(ICONS_FOLDERS[source], `${name}.svg`),
		'utf8'
	);
	inlineSvg = inlineSvg.replace('width="24" height="24"', '');
	inlineSvg = inlineSvg.replace(/fill="[^"]+"/g, '');
	inlineSvg = inlineSvg.replace(/stroke="[^"]+"/g, '');
	inlineSvg = inlineSvg.replace(/stroke-width="[^"]+"/g, '');
	inlineSvg = inlineSvg.replace(/stroke-linecap="[^"]+"/g, '');
	inlineSvg = inlineSvg.replace(/stroke-linejoin="[^"]+"/g, '');
	inlineSvg = inlineSvg.replace(/class="[^"]+"/g, '');
	inlineSvg = inlineSvg.replace(
		'viewBox="0 0 24 24"',
		`viewBox="0 0 24 24" width="1.2em" height="1.2em" id="${icon}-icon" class="icon" aria-hidden="true"`
	);
	return inlineSvg;
};

export const external_icon = (icon) => {
	let externalSvg = fs.readFileSync(`src/static/ui/icons/${icon}.svg`, 'utf8');
	let width =
		parseFloat(externalSvg.replace(/^.*?width="([^"]+)".*/, '$1')) * 16;
	let height =
		parseFloat(externalSvg.replace(/^.*?height="([^"]+)".*/, '$1')) * 16;
	return `<img src="/ui/icons/${icon}.svg" width="${width}" height="${height}" class="icon" loading="lazy" alt="" />`;
};
