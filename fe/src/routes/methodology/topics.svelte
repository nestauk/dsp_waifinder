<script>
	import MethodologyTopics from '../_content/methodology/Topics.svx';

	import {toolName} from '$lib/config';
</script>

<svelte:head>
	<title>Methodology - {toolName}</title>
	<meta
		content='{toolName}: methodology used to produce topics for organisations'
		name='description'
	>
</svelte:head>

<MethodologyTopics/>
