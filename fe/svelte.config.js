import adapterAuto from '@sveltejs/adapter-auto';
import adapterNetlify from '@sveltejs/adapter-netlify';
import {mdsvex} from 'mdsvex';

import {unescape_code} from './src/lib/utils/unescape-inlineCode.js';

// eslint-disable-next-line no-process-env
const adapter = process.env.ADAPTER === 'netlify'
	? adapterNetlify({
		edge: false,
		split: false
	})
	: adapterAuto();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	kit: {adapter},
	preprocess: [
		mdsvex({
			layout:'./src/lib/components/mdsvex/_layout.svelte',
			extensions: ['.svx', '.md'],
			remarkPlugins: [unescape_code]
		})
	]
};

export default config;
