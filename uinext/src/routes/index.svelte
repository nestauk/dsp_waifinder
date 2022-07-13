<script>
	import {onMount} from 'svelte';
	import {stores} from '@sapper/app';
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import Medium from 'app/components/homeScreen/medium/Medium.svelte';
	import Small from 'app/components/homeScreen/small/Small.svelte';
	import View from 'app/components/viewports/View.svelte';
	import ViewsXor from 'app/components/viewports/ViewsXor.svelte';
	import {toolName} from 'app/config';
	import { createMapMachine } from 'app/machines/map/route';
	import { parseParams } from 'app/machines/builder/formediting.options';

	import {_orgs} from 'app/stores/data';
	import {updateDataset} from 'app/stores/dataset';
	import {_screenId} from 'app/stores/layout';
	import {setDefaultActiveView} from 'app/stores/navigation';
	import {getLonLat} from 'app/utils/dataUtils';


	const { machine: routeMachine, contextStores: {
		// config
		runQueryOnSelect,
		hideDisabledForms,
		hideDisabledAggregations,
		hideDisabledDatasets,
		hideDisabledFields,
		selectedForm,
		selectedRequestTab,
		showFullResponse,
		resultSize,
		forms,
		dataset,
		// docs
		activeDocs,
		aggDocText,
	}} = createMapMachine();

	const loadData = async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		json && updateDataset(json);
	}

	const { page } = stores();
	let eventType = 'READY';
	onMount(async () => {
		const loadPage = ({params}) => {
			const event = {
				query: params.q && rison.decode(params.q),
			};
			routeMachine.send(eventType);
			parseParams(routeMachine, event);
			eventType = 'ROUTE_CHANGED';
		};

		const pageReloader = () => {
			const urlParams = new URL(document.location.toString()).searchParams;
			loadPage({
				params: _.fromPairs(Array.from(urlParams.entries()))
			});
		};
		addEventListener('popstate', pageReloader);
		const unsubscribe = page.subscribe(pageReloader);

		if (process.env.INSPECT === 'true') {
			const module = await import('@xstate/inspect');
			module.inspect({
				url: "https://statecharts.io/inspect",
				iframe: false
			});
		}

		return () => {
			removeEventListener('popstate', pageReloader);
			unsubscribe?.();
		};
	});

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
