<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';

	import VirtualList from '$lib/components/VirtualList/VirtualList.svelte';

	import OrgDetails from './OrgDetails.svelte';

	export let items = [];

	let virtualList;

	const refreshList = () => virtualList?.refreshAction();

	$: $_screen && refreshList();
</script>

<div class='OrgsList'>
	<VirtualList
		{items}
		bind:this={virtualList}
		let:item
	>
		<OrgDetails
			{item}
			on:foldingToggled={refreshList}
		/>
	</VirtualList>
</div>

<style>
	.OrgsList {
		height: 100%;
		overflow: auto;
	}
</style>
