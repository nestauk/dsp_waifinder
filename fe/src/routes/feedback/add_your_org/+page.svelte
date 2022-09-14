<script>
	import {toolName, addOrgFormUrl} from '$lib/config';
</script>

<svelte:head>
	<title>Add your org - {toolName}</title>
	<meta
		content='{toolName}: a form to propose your org to be added to the map'
		name='description'
	>
</svelte:head>

<main class='feedback'>
	<iframe
		frameborder='0'
		marginheight='0'
		marginwidth='0'
		src={addOrgFormUrl}
		title='Add your organisation'
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
