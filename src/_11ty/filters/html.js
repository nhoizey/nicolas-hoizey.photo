const truncateHtml = require('truncate-html');
const entities = require('entities');

module.exports = {
  decodeEntities: (content) => {
    return entities.decodeHTML(content);
  },
  encodeEntities: (content) => {
    return entities.encodeHTML(content);
  },
  escapeQuotes: (content, withinQuotation = false) =>
    content.replaceAll(/"([^"]+)"/g, withinQuotation ? '‘$1’' : '“$1”'),
  cleanDeepLinks: (content) => {
    if (content === undefined) {
      return '';
    }
    const regex = / <a class="deeplink"((?!(<\/a>)).|\n)+<\/a>/gm;
    return content.replace(regex, '');
  },
  excerpt: (content) => {
    if (content === undefined) {
      return '';
    }
    const regex = /(<p( [^>]*)?>((?!(<\/p>)).|\n)+<\/p>)/m;
    let excerpt = '';

    // Remove paragraphs containing only an image
    cleanContent = content.replace(/<p><img [^>]+><\/p>/, '');

    // Get first paragraph, if there's at least one, and remove the paragraph tag
    if ((matches = regex.exec(cleanContent)) !== null) {
      excerpt = matches[0].replace(
        /<p( [^>]*)?>(((?!(<\/p>)).|\n)+)<\/p>/,
        '$2'
      );
    }

    return excerpt;
  },
  truncateHtml: (html, length) => {
    return truncateHtml(html, length, {
      reserveLastWord: true,
      ellipsis: '…',
    });
  },
  extractHeadingsText: (html) => {
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
  },
};
