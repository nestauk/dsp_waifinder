<script context='module'>
	import {_screen} from '@svizzle/ui';

	import a from './a.svelte';
	import blockquote from './blockquote.svelte';
	import code from './code.svelte';
	import h1 from './h1.svelte';
	import h2 from './h2.svelte';
	import h3 from './h3.svelte';
	import h4 from './h4.svelte';
	import ol from './ol.svelte';
	import p from './p.svelte';
	import table from './table.svelte';
	import td from './td.svelte';
	import th from './th.svelte';
	import ul from './ul.svelte';

	export {a, blockquote, code, h1, h2, h3, h4, ol, p, table, td, th, ul};
</script>

<section class='_layout mdsvex {$_screen?.classes}'>
	<slot></slot>
</section>

<style>
	section {
		max-width: 900px;
		overflow-y: auto;
		padding: 0;
	}
</style>
