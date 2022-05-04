<script>
	import {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import Medium from 'app/components/homeScreen/Medium.svelte';
	import Small from 'app/components/homeScreen/Small.svelte';
	import View from 'app/components/ViewPorts/View.svelte';
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte';

	let data = {
		orgs: []
	};

	const loadData = async () => {
		const response = await fetch('/data/ai_map_orgs_places.json');
		data = await response.json();
		data.orgs.length = Math.max(3000, data.orgs.length);
	}
	$: isClientSide && loadData();
</script>

<ViewsXor
	viewId='{$_screen?.sizes?.medium? 'medium':'small'}'
>
	<View id='medium'>
		<Medium organizations={data.orgs}/>
	</View>
	<View id='small'>
		<Small organizations={data.orgs}/>
	</View>
</ViewsXor>

<style>

</style>