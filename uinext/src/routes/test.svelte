<script>
	import ViewsXor from 'app/components/ViewPorts/ViewsXor.svelte'
	import MaybeView from 'app/components/ViewPorts/MaybeView.svelte'
	import Small from 'app/components/Small.svelte';
	import Quads from 'app/components/Quads.svelte';
</script>

<ViewsXor
	currentViewId='0'
>
	<MaybeView id='0'>
		<Quads />
	</MaybeView>
	<MaybeView id='1'>
		<Small/>
	</MaybeView>
</ViewsXor>
