<script>
	import LinkButton from '@svizzle/ui/src/LinkButton.svelte';
	import Home from './_content/Index.svx';
	import ResponsiveFlex from '@svizzle/ui/src/ResponsiveFlex.svelte';
	
	import {toolName} from 'app/config';
	import theme from 'app/theme';
</script>

<svelte:head>
	<title>About - {toolName}</title>
	<meta
		content='{toolName}: homepage'
		name='description'
	>
</svelte:head>

<main>
	<div>
		<Home />
	</div>
</main>

<style>
	main {
		background-color: var(--color-background);
		display: flex;
		font-weight: 200;
		height: 100%;
		justify-content: space-around;
		width: 100%;
	}

	div {
		background-color: white;
		max-width: 900px;
		overflow-y: auto;
		padding: 2rem;
	}
</style>
