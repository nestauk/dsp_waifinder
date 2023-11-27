<script>
	import {toolName} from '$lib/config.js';

	import Disclaimer from '$lib/_content/info/Disclaimer.svx';
</script>

<svelte:head>
	<title>Disclaimer - {toolName}</title>
	<meta
		content='{toolName}: disclaimer'
		name='description'
	>
</svelte:head>

<Disclaimer/>
