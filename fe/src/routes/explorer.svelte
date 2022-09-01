<script>
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import ExplorerMedium from '$lib/components/explorer/medium/ExplorerMedium.svelte';
	import ExplorerSmall from '$lib/components/explorer/small/ExplorerSmall.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {toolName} from '$lib/config';
	import {updateDataset} from '$lib/stores/dataset';
	import {_screenId} from '$lib/stores/layout';
	import {setDefaultActiveView} from '$lib/stores/navigation';

	const loadData = async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		json && updateDataset(json);
	}

	$: isClientSide && loadData();
	$: $_screenId && setDefaultActiveView();
</script>

<svelte:head>
	<title>Home - {toolName}</title>
	<meta
		content='A tool to visualise AI orgs in the UK'
		name='description'
	>
</svelte:head>

<ViewsXor viewId={$_screenId}>
	<View id='medium'>
		<ExplorerMedium />
	</View>
	<View id='small'>
		<ExplorerSmall />
	</View>
</ViewsXor>
