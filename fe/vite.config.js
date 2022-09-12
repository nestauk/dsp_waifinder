import {sveltekit} from '@sveltejs/kit/vite';

const config = {
	plugins: [sveltekit()],
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			// so `fe/src/lib/utils/version.js` may import from `package.json`
			allow: ['..']
		}
	}
};

export default config;
