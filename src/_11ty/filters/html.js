import { default as truncateHtmlPackage } from 'truncate-html';
import { decodeHTML, encodeHTML } from 'entities';

export const decodeEntities = (content) => {
	return decodeHTML(content);
};

export const encodeEntities = (content) => {
	return encodeHTML(content);
};

export const escapeQuotes = (content, withinQuotation = false) =>
	content.replaceAll(/"([^"]+)"/g, withinQuotation ? '‘$1’' : '“$1”');

export const extractHeadingsText = (html) => {
	if (html === undefined) {
		return '';
	}

	let headingsText = '';
	const matches = html.matchAll(/<(h[1-6])>(?<heading>.*)<\/\1>/g);
	if (matches) {
		for (const match of matches) {
			headingsText += match.groups.heading;
		}
	}
	return headingsText;
};
