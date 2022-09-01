/* eslint-disable no-process-env */
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import dsv from '@rollup/plugin-dsv';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import yaml from '@rollup/plugin-yaml';
import {mdsvex} from 'mdsvex';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';

import pkg from './package.json';
import {unescape_code} from './src/lib/utils/unescape-inlineCode';

const appRoot = path.join(__dirname, 'src/lib');
const aliasConfig = alias({
	resolve: ['.js', '.svelte', '.svx'],
	entries: [
		{find: '$lib', replacement: appRoot}
	]
});

console.log('appRoot', appRoot)

// locally: 'development'
// Netlify: 'dev'|'staging'|'release'
const nodeEnv = process.env.NODE_ENV;

const isExported = process.env.SAPPER_EXPORT;
const legacy = Boolean(process.env.SAPPER_LEGACY_BUILD);

const IS_DEV = ['development', 'dev'].includes(nodeEnv);

const onwarn = (warning, warn) => (
	warning.code === 'MISSING_EXPORT' && (/'preload'/u).test(warning.message) ||
	warning.code === 'CIRCULAR_DEPENDENCY' && (/[/\\]@sapper[/\\]/u).test(warning.message) ||
	warning.code !== 'CIRCULAR_DEPENDENCY'
) && warn(warning);

/* backend */

const BACKEND_BASES = {
	development: 'http://localhost:4000',
	dev: 'https://dev.ai-map.dv.dap-tools.uk',
	staging: 'https://staging.ai-map.dv.dap-tools.uk',
	// release: 'TODO',
}

// eslint-disable-next-line no-process-env
const BACKEND_BASE = BACKEND_BASES[nodeEnv];

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		preserveEntrySignatures: false,
		plugins: [
			replace({
				'process.browser': true,
				'process.env.SAPPER_EXPORT': JSON.stringify(isExported),
				BACKEND_BASE: JSON.stringify(BACKEND_BASE),
				IS_DEV,
			}),
			svelte({
				extensions: [
					'.svelte',
					'.svx'
				],
				preprocess: mdsvex({
					layout:'./src/lib/components/mdsvex/_layout.svelte',
					remarkPlugins: [unescape_code]
				}),
				compilerOptions: {
					dev: IS_DEV,
					hydratable: true,
				},
				emitCss: true,
			}),
			resolve({
				// browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),
			dsv(),
			json(),
			yaml(),
			aliasConfig,

			legacy && babel({
				extensions: ['.js', '.mjs', '.html', '.svelte'],
				runtimeHelpers: true,
				exclude: ['node_modules/@babel/**'],
				presets: [
					['@babel/preset-env', {
						targets: '> 0.25%, not dead'
					}]
				],
				plugins: [
					'@babel/plugin-syntax-dynamic-import',
					['@babel/plugin-transform-runtime', {
						useESModules: true
					}]
				]
			}),

			!IS_DEV && terser({
				module: true
			})
		],

		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		preserveEntrySignatures: false,
		plugins: [
			replace({
				'process.browser': false,
				'process.env.SAPPER_EXPORT': JSON.stringify(isExported),
				BACKEND_BASE: JSON.stringify(BACKEND_BASE),
				IS_DEV,
			}),
			svelte({
				extensions: [
					'.svelte',
					'.svx'
				],
				preprocess: mdsvex({
					layout:'./src/lib/components/mdsvex/_layout.svelte',
					remarkPlugins: [unescape_code]
				}),
				compilerOptions: {
					dev: IS_DEV,
					generate: 'ssr',
				},
			}),
			resolve({
				dedupe: ['svelte']
			}),
			commonjs(),
			dsv(),
			json(),
			yaml(),
			aliasConfig
		],
		external:
			Object.keys(pkg.dependencies)
			.filter(name => ![
				'@svizzle/barchart',
				'@svizzle/choropleth',
				'@svizzle/utils',
			].includes(name))
			.concat(
				// eslint-disable-next-line global-require
				require('module').builtinModules ||
				Object.keys(process.binding('natives'))
			),

		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		preserveEntrySignatures: false,
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.SAPPER_EXPORT': JSON.stringify(isExported),
				BACKEND_BASE: JSON.stringify(BACKEND_BASE),
				IS_DEV,
			}),
			commonjs(),
			dsv(),
			json(),
			yaml(),
			!IS_DEV && terser()
		],

		onwarn,
	}
};
