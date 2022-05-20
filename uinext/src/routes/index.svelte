<script>
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import * as _ from 'lamb';

	import Medium from 'app/components/homeScreen/medium/Medium.svelte';
	import Small from 'app/components/homeScreen/small/Small.svelte';
	import View from 'app/components/ViewPorts/View.svelte';
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte';
	import {_data, _orgs} from 'app/stores/data';
	import {_screenId} from 'app/stores/layout';
	import {setDefaultActiveView} from 'app/stores/navigation';
	import {getLonLat} from 'app/utils/dataUtils';

	const loadData = async () => {
		const response = await fetch('/data/ai_map_annotated_orgs.json');
		const json = await response.json();

		if (json) {
			_data.set(json);
		}
	}

	$: isClientSide && loadData();
	$: $_screenId && setDefaultActiveView();
</script>

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
