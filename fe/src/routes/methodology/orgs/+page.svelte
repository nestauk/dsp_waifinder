<script>
	import MethodologyOrgs from '$lib/_content/methodology/Orgs.svx';

	import {toolName} from '$lib/config.js';
</script>

<svelte:head>
	<title>Methodology - {toolName}</title>
	<meta
		content='{toolName}: methodology used to produce the dataset of organisations'
		name='description'
	>
</svelte:head>

<MethodologyOrgs/>
