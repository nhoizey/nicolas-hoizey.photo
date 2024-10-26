export default {
	nav:
		process.env.ELEVENTY_RUN_MODE === 'build'
			? {}
			: {
					order: 20,
					icon: 'info',
				},
};
