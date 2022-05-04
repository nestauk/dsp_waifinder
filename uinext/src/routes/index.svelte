<script>
	import * as _ from 'lamb';
	import {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import Medium from 'app/components/homeScreen/Medium.svelte';
	import Small from 'app/components/homeScreen/Small.svelte';
	import View from 'app/components/ViewPorts/View.svelte';
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte';

	let organizations = [];

	/* property getters */

	export const getLngLat = _.pipe([
		_.getKey('location'),
		_.collect([_.getKey('lon'), _.getKey('lat')])
	]);
	export const getID = _.getKey("name");
	export const getLink = _.getKey("url");


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
		<Medium
			items={organizations}
			{getID}
			{getLink}
			{getLngLat}
		/>
	</View>
	<View id='small'>
		<Small
			items={organizations}
			{getID}
			{getLink}
			{getLngLat}
		/>
	</View>
</ViewsXor>
