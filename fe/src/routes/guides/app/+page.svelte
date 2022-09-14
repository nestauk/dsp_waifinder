<script>
	import {_screen} from '@svizzle/ui';

	import AppMedium from '$lib/_content/guides/AppMedium.svx';
	import AppSmall from '$lib/_content/guides/AppSmall.svx';

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
	<AppMedium />
{:else}
	<AppSmall />
{/if}
