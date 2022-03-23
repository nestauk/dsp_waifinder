<script>
	import Link from '@svizzle/ui/src/Link.svelte';
	import appTheme from 'app/theme';
  
	const theme = {
	  color: appTheme.colorLink,
	  iconStroke: appTheme.colorLink
	};

	export let href;
	
	$: type = href && href.startsWith('http') && 'external' || null;
</script>

<Link
	{...$$props}
	{theme}
	{type}
	isBold={true}
	showIcon={true}
><slot/></Link>