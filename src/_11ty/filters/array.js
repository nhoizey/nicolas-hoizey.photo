import util from "node:util";

export const pixelfedFaves = (pixelfedData) => {
	if (!Array.isArray(pixelfedData)) {
		return 0;
	}
	return pixelfedData.reduce(
		(accumulator, currentValue) => accumulator + currentValue.faves,
		0,
	);
};

export const betterDump = (value) => `<pre>${util.inspect(value)}</pre>`;
