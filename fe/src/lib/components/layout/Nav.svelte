<script>
	import {isServerSide} from '@svizzle/ui';

	import NavMedium from '$lib/components/layout/medium/NavMedium.svelte';
	import NavSmall from '$lib/components/layout/small/NavSmall.svelte';
	import {_isSmallScreen} from '$lib/stores/layout';

	export let contentHeight;
	export let segment;
	export let showA11yMenu = false;
	export let isA11yDirty = false;
</script>

{#if $_isSmallScreen || isServerSide}
	<NavSmall
		{contentHeight}
		{isA11yDirty}
		{segment}
		bind:showA11yMenu
	/>
{:else}
	<NavMedium {segment} />
{/if}
