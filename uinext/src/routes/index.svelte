<script>
	import {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';

	import MaybeView from 'app/components/ViewPorts/MaybeView.svelte'
	import Medium from 'app/components/Medium.svelte';
	import Small from 'app/components/Small.svelte';
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte'
</script>

<ViewsXor
	currentViewId='{$_screen?.sizes?.medium? '0':'1'}'
>
	<MaybeView id='0'>
		<Medium />
	</MaybeView>
	<MaybeView id='1'>
			<Small/>
	</MaybeView>
</ViewsXor>

<style>

</style>