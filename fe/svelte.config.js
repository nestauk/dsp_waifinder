import adapter from '@sveltejs/adapter-auto';
import {mdsvex} from 'mdsvex';

import {unescape_code} from './src/lib/utils/unescape-inlineCode.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	kit: {
		adapter: adapter()
	},
	preprocess: [
		mdsvex({
			layout:'./src/lib/components/mdsvex/_layout.svelte',
			extensions: ['.svx', '.md'],
			remarkPlugins: [unescape_code]
		})
	]
};

export default config;
