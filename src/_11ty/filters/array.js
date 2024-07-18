module.exports = {
	pixelfedFaves: (pixelfedData) => {
		if (!Array.isArray(pixelfedData)) {
			return 0;
		}
		return pixelfedData.reduce(
			(accumulator, currentValue) => accumulator + currentValue.faves,
			0
		);
	},
};
