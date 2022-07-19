<script>
	import * as _ from 'lamb';
	import {onMount, setContext} from 'svelte';
	import rison from 'rison';
	import {stores} from '@sapper/app';

	import Medium from 'app/components/homeScreen/medium/Medium.svelte';
	import Small from 'app/components/homeScreen/small/Small.svelte';
	import View from 'app/components/viewports/View.svelte';
	import ViewsXor from 'app/components/viewports/ViewsXor.svelte';
	import {toolName} from 'app/config';
	import { createMapMachine } from 'app/machines/map/route';

	import {_orgs} from 'app/stores/data';
	import {_screenId} from 'app/stores/layout';
	import {setDefaultActiveView} from 'app/stores/navigation';
	import {getLonLat} from 'app/utils/dataUtils';


	const {__bus} = createMapMachine();
	setContext('__bus', __bus)

	const { page } = stores();

	onMount(() => {
		const getQuery = () => {
			const urlParams = new URL(document.location.toString()).searchParams;
			const params = _.fromPairs(Array.from(urlParams.entries()));
			const query = params.q && rison.decode(params.q);
			return query;
		};

		const updateRoute = () => {
			const query = getQuery();
			__bus.send('ROUTE_CHANGED', {query});
		};

		addEventListener('popstate', updateRoute);
		const unsubscribe = page.subscribe(updateRoute);

		return () => {
			removeEventListener('popstate', updateRoute);
			unsubscribe?.();
		};
	});

	$: $_screenId && setDefaultActiveView();

	$: console.log('bus', $__bus);
	$: console.log('page', $page)
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
