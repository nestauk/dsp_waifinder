<script>
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import Medium from 'app/components/explorer/medium/Medium.svelte';
	import Small from 'app/components/explorer/small/Small.svelte';
	import View from 'app/components/viewports/View.svelte';
	import ViewsXor from 'app/components/viewports/ViewsXor.svelte';
	import {toolName} from 'app/config';
	import {_orgs} from 'app/stores/data';
	import {updateDataset} from 'app/stores/dataset';
	import {_screenId} from 'app/stores/layout';
	import {setDefaultActiveView} from 'app/stores/navigation';
	import {getLonLat} from 'app/utils/dataUtils';

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
		<Medium
			{getLonLat}
			items={$_orgs}
		/>
	</View>
	<View id='small'>
		<Small
			{getLonLat}
			items={$_orgs}
		/>
	</View>
</ViewsXor>
