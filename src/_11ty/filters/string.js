import slugifyString from '../_utils/slugify.js';

const extraHashtags = {
	'#LandscapesAndNature': ['#Landscape', '#LandscapePhotography'],
	'#MountainLandscapePhotography': ['#Mountain'],
	'#Travels': ['#Travel', '#TravelPhotography'],
	'#RiversAndLakes': ['#Water'],
	'#MaasaiMaraNationalReserve': ['#MaasaiMara', '#NationalPark'],
	'#LakeNakuruNationalPark': ['#LakeNakuru', '#NationalPark'],
	'#AmboseliNationalPark': ['#Amboseli', '#NationalPark'],
	'#TsavoWestNationalPark': ['#Tsavo', '#NationalPark'],
};

export const slugify = (string) => slugifyString(string);

export const base64 = (string) => {
	return Buffer.from(string).toString('base64');
};

export const clean4cloudinary = (string) =>
	string.replace(',', '%252C').replace('/', '%252F').replace('?', '%253F');

export const tagToHashtag = (tag) => {
	let hashtag = tag.toString();
	hashtag = hashtag.replaceAll('/', ' ');
	// Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
	hashtag = hashtag.normalize('NFD');
	// Remove https://en.wikipedia.org/wiki/Combining_Diacritical_Marks
	hashtag = hashtag.replace(/[\u0300-\u036f]/g, '');

	hashtag = hashtag.replaceAll("'", ' ');
	hashtag = hashtag.replaceAll('&#39;', ' ');

	let words = hashtag.replaceAll(/[-\.]/g, ' ').split(' ');
	hashtag =
		'#' +
		words[0] +
		words
			.slice(1)
			.map((word) => word.charAt(0).toUpperCase() + word.substr(1))
			.join('');

	if (extraHashtags[hashtag] !== undefined) {
		return extraHashtags[hashtag].join(' ');
	} else {
		return hashtag;
	}
};
