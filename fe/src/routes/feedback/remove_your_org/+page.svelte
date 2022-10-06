<script>
	import {toolName, removeOrgFormUrl} from '$lib/config';
</script>

<svelte:head>
	<title>Remove your org - {toolName}</title>
	<meta
		content='{toolName}: a form to request that your org to be removed from the map'
		name='description'
	>
</svelte:head>

<main class='feedback'>
	<iframe
		frameborder='0'
		marginheight='0'
		marginwidth='0'
		src={removeOrgFormUrl}
		title='Remove your organisation'
	/>
</main>

<style>
	main, iframe {
		height: 100%;
		width: 100%;
	}
	main {
		position: relative;
	}
</style>
