<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import ExplorerMedium from '$lib/_content/guides/explorer/ExplorerMedium.svx';
	import ExplorerSmall from '$lib/_content/guides/explorer/ExplorerSmall.svx';

	import {toolName} from '$lib/config';
</script>

<svelte:head>
	<title>App guide - {toolName}</title>
	<meta
		content='{toolName}: how to use the app'
		name='description'
	>
</svelte:head>

{#if $_screen?.sizes.medium}
	<ExplorerMedium />
{:else}
	<ExplorerSmall />
{/if}
