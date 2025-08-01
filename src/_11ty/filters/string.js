import slugifyString from "../_utils/slugify.js";

const replaceHashtags = {
	"#LandscapesAndNature": ["#LandscapePhotography"],
	"#Miscellaneous": [],
	"#MountainLandscapePhotography": ["#Mountain"],
	"#Travels": ["#TravelPhotography"],
	"#RiversAndLakes": ["#Water"],
	"#MaasaiMaraNationalReserve": ["#MaasaiMara"],
	"#LakeNakuruNationalPark": ["#LakeNakuru"],
	"#AmboseliNationalPark": ["#Amboseli"],
	"#TsavoWestNationalPark": ["#Tsavo"],
	"#HOScale": ["#ToyPhotography"],
};

export const slugify = (string) => slugifyString(string);

export const base64 = (string) => {
	return Buffer.from(string).toString("base64");
};

export const clean4cloudinary = (string) =>
	string.replace(",", "%252C").replace("/", "%252F").replace("?", "%253F");

export const tagToHashtag = (tag) => {
	let hashtag = tag.toString();
	hashtag = hashtag.replaceAll("/", " ");
	// Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
	hashtag = hashtag.normalize("NFD");
	// Remove https://en.wikipedia.org/wiki/Combining_Diacritical_Marks
	hashtag = hashtag.replace(/[\u0300-\u036f]/gu, "");

	hashtag = hashtag.replaceAll("'", " ");
	hashtag = hashtag.replaceAll("&#39;", " ");

	const words = hashtag.replaceAll(/[-.]/g, " ").split(" ");
	hashtag = `#${words[0]}${words
		.slice(1)
		.map((word) => word.charAt(0).toUpperCase() + word.substr(1))
		.join("")}`;

	if (replaceHashtags[hashtag] !== undefined) {
		return replaceHashtags[hashtag].join(" ");
	}
	return hashtag;
};

export const tweakPath = (inputPath, outputPath) => {
	if (outputPath.match(/exhibitionsZZZZZZZ/)) {
		console.log("");
		console.log("Tweaking path", outputPath);
	}
	if (outputPath.match(/(oldest-first|newest-first|by-popularity)/g)) {
		const tweakedInputPath = outputPath
			// .replace(/\/(oldest-first|newest-first|by-popularity)/, "")
			.replace("_site/", "src/pages/");
		// if (outputPath.match(/exhibitions/)) {
		// 	console.log("Tweaked path", tweakedInputPath);
		// }
		return tweakedInputPath;
	}

	return inputPath;
};
