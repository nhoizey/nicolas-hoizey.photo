import dotenv from 'dotenv';
dotenv.config();

export default {
	title: 'Nicolas Hoizey photography',
	description: 'The photography portfolio of Nicolas Hoizey',
	url:
		process.env.ELEVENTY_RUN_MODE === 'build'
			? 'https://nicolas-hoizey.photo'
			: 'http://localhost:8080',
	author: {
		name: 'Nicolas Hoizey',
		email: 'nicolas@hoizey.com',
		url: 'https://nicolas-hoizey.com',
	},
	opengraph: {
		background: 'resources/nho-photo-opengraph-background',
		prefix:
			'https://res.cloudinary.com/nho/image/upload/w_1200,h_630,c_fill,q_auto,f_auto',
		title: {
			left: {
				before: 'w_480,c_fit,co_rgb:f7f5fa,l_text:Roboto%20Condensed_50',
				after: 'fl_layer_apply,g_south_west,y_384,x_48',
			},
			top: {
				before: 'w_1104,c_fit,co_rgb:f7f5fa,l_text:Roboto%20Condensed_50',
				after: 'fl_layer_apply,g_north_west,y_96,x_48',
			},
		},
		subtitle: {
			left: {
				before: 'w_480,c_fit,co_rgb:bda7d3,l_text:Roboto%20Condensed_30',
				after: 'fl_layer_apply,g_south_west,y_288,x_48',
			},
			top: {
				before: 'w_1104,c_fit,co_rgb:bda7d3,l_text:Roboto%20Condensed_30',
				after: 'fl_layer_apply,g_south_west,y_288,x_48',
			},
		},
	},
	cloudinary:
		process.env.ELEVENTY_RUN_MODE === 'build'
			? 'https://res.cloudinary.com/nho/image/fetch/q_auto,f_auto/'
			: '',
};
