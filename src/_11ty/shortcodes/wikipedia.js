export const wikipedia = (title, url) => {
	// adapted from Chicago Style: https://en.wikipedia.org/w/index.php?title=Special:CiteThisPage&page=Eastern_Desert&id=1029561064&wpFormIdentifier=titleform#Chicago_style
	return `— <cite>Wikipedia contributors, "<a href="${url}">${title}</a>", <i>Wikipedia, The Free Encyclopedia</i>.</cite>`;
};
