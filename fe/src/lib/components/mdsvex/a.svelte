<script>
	import {Link} from '@svizzle/ui';

	import {_currThemeVars} from '$lib/stores/theme';

	export let href;

	$: theme = {
		color: $_currThemeVars['--colorLink'],
		iconStroke: $_currThemeVars['--colorLink'],
		outlineColor: $_currThemeVars['--colorOutline'],
		outlineStyle: $_currThemeVars['--focusLineStyle'],
		outlineWidth: $_currThemeVars['--focusLineWidth'],
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
