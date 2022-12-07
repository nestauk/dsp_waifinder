<script>
	import Link from '$lib/components/svizzle/Link.svelte';

	import {_currThemeVars} from '$lib/stores/theme';

	export let href;

	$: theme = {
		color: $_currThemeVars['--colorLink'],
		focusOutline: $_currThemeVars['--outline'],
		iconStroke: $_currThemeVars['--colorLink']
	};
	$: type = href && href.startsWith('http') && 'external' || null;
</script>

<Link
	{...$$props}
	{theme}
	{type}
	isBold={true}
	showIcon={true}
><slot/></Link>
