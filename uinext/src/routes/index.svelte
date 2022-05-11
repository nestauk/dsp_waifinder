<script>
	import {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import {getId} from '@svizzle/utils';
	import * as _ from 'lamb';

	import Medium from 'app/components/homeScreen/Medium.svelte';
	import Small from 'app/components/homeScreen/Small.svelte';
	import View from 'app/components/ViewPorts/View.svelte';
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte';
	import {getLonLat} from 'app/utils/dataUtils';

	let items;

	const loadData = async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		if (json) {
			const {orgs, places, org_types} = json;
			const placesById = _.index(places, getId);
			items = _.map(orgs,
				org => ({
					...org,
					place: placesById[org.place_id],
					types: _.map(org.types, typeId => org_types[typeId])
				})
			)
		}
	}

	$: isClientSide && loadData();
	$: viewId = $_screen?.sizes?.medium ? 'medium': 'small';
</script>

<ViewsXor {viewId}>
	<View id='medium'>
		<Medium
			{getLonLat}
			{items}
		/>
	</View>
	<View id='small'>
		<Small
			{getLonLat}
			{items}
		/>
	</View>
</ViewsXor>
