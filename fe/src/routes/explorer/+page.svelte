<script>
	import {isClientSide} from '@svizzle/ui';

	import ExplorerMedium from '$lib/components/explorer/medium/ExplorerMedium.svelte';
	import ExplorerSmall from '$lib/components/explorer/small/ExplorerSmall.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {toolName} from '$lib/config';
	import {updateDataset} from '$lib/stores/dataset';
	import {_screenId} from '$lib/stores/layout';
	import {_autoZoom} from '$lib/stores/interaction';
	import {setDefaultActiveView} from '$lib/stores/navigation';

	const loadData = async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		json && updateDataset(json);
	}

	const onBboxChanged = () => {
		$_autoZoom = false;
	}

	$: isClientSide && loadData();
	$: $_screenId && setDefaultActiveView();
</script>

<svelte:head>
	<title>Explorer - {toolName}</title>
	<meta
		content='A tool to visualise AI orgs in the UK'
		name='description'
	>
</svelte:head>

<ViewsXor viewId={$_screenId}>
	<View id='medium'>
		<ExplorerMedium
			on:bboxChanged={onBboxChanged}
		/>
	</View>
	<View id='small'>
		<ExplorerSmall
			on:bboxChanged={onBboxChanged}
		/>
	</View>
</ViewsXor>
