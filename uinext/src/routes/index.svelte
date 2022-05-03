<script>
	import {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';

	import Medium from 'app/components/homeScreen/Medium.svelte';
	import Small from 'app/components/homeScreen/Small.svelte';
	import View from 'app/components/ViewPorts/View.svelte';
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte';
</script>

<ViewsXor
	currentViewId='{$_screen?.sizes?.medium? 'medium':'small'}'
>
	<View id='medium'>
		<Medium />
	</View>
	<View id='small'>
		<Small/>
	</View>
</ViewsXor>

<style>

</style>