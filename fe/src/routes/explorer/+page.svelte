<script>
	import {isClientSide, View, ViewsXor} from '@svizzle/ui';

	import ExplorerMedium from '$lib/components/explorer/medium/ExplorerMedium.svelte';
	import ExplorerSmall from '$lib/components/explorer/small/ExplorerSmall.svelte';
	import {toolName} from '$lib/config.js';
	import {_dataset, updateDataset} from '$lib/stores/dataset.js';
	import {_screenId} from '$lib/stores/layout.js';
	import {_autoZoom} from '$lib/stores/interaction.js';
	import {setDefaultActiveView} from '$lib/stores/navigation.js';

	const loadData = async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		json && updateDataset(json);
	}

	const onBboxChanged = () => {
		$_autoZoom = false;
	}

	$: isClientSide && $_dataset.isEmpty && loadData();
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
