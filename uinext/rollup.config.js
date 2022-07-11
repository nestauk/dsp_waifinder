/* eslint-disable no-process-env */
import commonjs from '@rollup/plugin-commonjs';
import dsv from '@rollup/plugin-dsv';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import yaml from '@rollup/plugin-yaml';
import {mdsvex} from 'mdsvex';
import babel from 'rollup-plugin-babel';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';

import {unescape_code} from './src/node_modules/app/utils/unescape-inlineCode';
import pkg from './package.json';

const nodeEnv = process.env.NODE_ENV; // set in Netlify: 'dev'|'staging'|'release'
const isExported = process.env.SAPPER_EXPORT;
const legacy = Boolean(process.env.SAPPER_LEGACY_BUILD);
const isDev = nodeEnv === 'dev';

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
const BACKEND_BASE = BACKEND_BASES[process.env.NODE_ENV];

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		preserveEntrySignatures: false,
		plugins: [
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(nodeEnv),
				'process.env.SAPPER_EXPORT': JSON.stringify(isExported),
				BACKEND_BASE: JSON.stringify(BACKEND_BASE),
			}),
			svelte({
				extensions: [
					'.svelte',
					'.svx'
				],
				preprocess: mdsvex({
					layout:'./src/node_modules/app/components/mdsvex/_layout.svelte',
					remarkPlugins: [unescape_code]
				}),
				compilerOptions: {
					dev: isDev,
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

			!isDev && terser({
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
				'process.env.NODE_ENV': JSON.stringify(nodeEnv),
				'process.env.SAPPER_EXPORT': JSON.stringify(isExported),
				BACKEND_BASE: JSON.stringify(BACKEND_BASE),
			}),
			svelte({
				extensions: [
					'.svelte',
					'.svx'
				],
				preprocess: mdsvex({
					layout:'./src/node_modules/app/components/mdsvex/_layout.svelte',
					remarkPlugins: [unescape_code]
				}),
				compilerOptions: {
					dev: isDev,
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
				'process.env.NODE_ENV': JSON.stringify(nodeEnv),
				'process.env.SAPPER_EXPORT': JSON.stringify(isExported),
				BACKEND_BASE: JSON.stringify(BACKEND_BASE),
			}),
			commonjs(),
			dsv(),
			json(),
			yaml(),
			!isDev && terser()
		],

		onwarn,
	}
};
