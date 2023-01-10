<script>
	import {Link} from '@svizzle/ui';

	import {_linkTheme1} from '$lib/stores/theme';

	export let href;

	$: type = href && href.startsWith('http') && 'external' || null;
</script>

<Link
	{...$$props}
	theme={$_linkTheme1}
	{type}
	isBold={true}
	showIcon={true}
><slot/></Link>
