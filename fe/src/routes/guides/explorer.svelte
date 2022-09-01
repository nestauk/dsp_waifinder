<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import ExplorerMedium from '../_content/guides/explorer/ExplorerMedium.svx';
	import ExplorerSmall from '../_content/guides/explorer/ExplorerSmall.svx';

	import {toolName} from 'app/config';
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
