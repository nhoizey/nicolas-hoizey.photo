import util from "node:util";

export const mastodonFaves = (mastodonData) => {
	if (!Array.isArray(mastodonData)) {
		return 0;
	}
	return mastodonData.reduce(
		(accumulator, currentValue) => accumulator + currentValue.faves,
		0,
	);
};

export const betterDump = (value) => `<pre>${util.inspect(value)}</pre>`;
