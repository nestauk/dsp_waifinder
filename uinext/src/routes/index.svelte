<script>
	import {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import * as _ from 'lamb';

	import Medium from 'app/components/homeScreen/Medium.svelte';
	import Small from 'app/components/homeScreen/Small.svelte';
	import View from 'app/components/ViewPorts/View.svelte';
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte';

	let organizations = [];

	const loadData = async () => {
		const response = await fetch('/data/ai_map_orgs_places.json');
		const fulldata = await response.json();

		organizations = fulldata?.orgs || [];
	}

	$: isClientSide && loadData();
	$: viewId = $_screen?.sizes?.medium ? 'medium': 'small';
</script>

<ViewsXor {viewId}>
	<View id='medium'>
		<Medium {organizations}/>
	</View>
	<View id='small'>
		<Small {organizations}/>
	</View>
</ViewsXor>
