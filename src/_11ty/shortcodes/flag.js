import fs from "node:fs";
import path from "node:path";

const FLAGS_FOLDER = "node_modules/svg-country-flags/svg/";

export const flagSvg = (countryCode) => {
	const svgFile = path.join(FLAGS_FOLDER, `${countryCode}.svg`);
	if (!fs.existsSync(svgFile)) {
		return "";
	}
	let svg = fs.readFileSync(svgFile, "utf8");
	svg = svg.replace("<svg ", '<svg class="flag" ');
	return svg;
};
