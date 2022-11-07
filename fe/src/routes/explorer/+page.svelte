<script>
	import {isClientSide} from '@svizzle/ui';
	import {onMount, setContext} from 'svelte';

	import {getStores} from '$app/stores';
	import ExplorerMedium from '$lib/components/explorer/layout/medium/ExplorerMedium.svelte';
	import ExplorerSmall from '$lib/components/explorer/layout/small/ExplorerSmall.svelte';
	import {createMapMachine} from '$lib/machines/explorer/route';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {toolName} from '$lib/config';
	import {_dataset, updateDataset} from '$lib/stores/dataset';
	import {_screenId} from '$lib/stores/layout';
	import {_autoZoom} from '$lib/stores/interaction';
	import {setDefaultActiveView} from '$lib/stores/navigation';

	const {page} = getStores();

	const loadData = async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		json && updateDataset(json);
	}

	const onBboxChanged = () => {
		$_autoZoom = false;
	}

	const {__bus} = createMapMachine();
	setContext('__bus', __bus)

	onMount(() => {
		console.log('Route mounted')

		const updateRoute = () => __bus.send('ROUTE_CHANGED');

		const statePopped = () => {
			console.log('popstate');
			updateRoute();
		}

		const pageChanged = () => {
			console.log('pageChanged')
			updateRoute()
		}

		addEventListener('popstate', statePopped);
		const unsubscribe = page.subscribe(pageChanged);

		__bus.send('CLIENT_DETECTED');

		return () => {
			removeEventListener('popstate', statePopped);
			unsubscribe?.();
		};
	});

	$: isClientSide && $_dataset.isEmpty && loadData();
	$: $_screenId && setDefaultActiveView();

	$: console.log('bus', $__bus);
	$: console.log('page', $page)
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
