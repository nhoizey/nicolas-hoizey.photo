module.exports = {
	plugins: ['prettier-plugin-jinja-template'],
	overrides: [
		{
			files: ['*.njk'],
			options: {
				parser: 'jinja-template',
			},
		},
	],
	printWidth: 80,
	semi: true,
	singleQuote: true,
	trailingComma: 'es5',
};
