<script>
	import {HyperLink} from '@svizzle/ui';

	import {_linkTheme1} from '$lib/stores/theme.js';

	export let href;

	$: type = href && href.startsWith('http') && 'external' || null;
</script>

<HyperLink
	{...$$props}
	theme={$_linkTheme1}
	{type}
	isBold={true}
	showIcon={true}
><slot/></HyperLink>
