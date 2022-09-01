<script>
	import SvgMarkers from './SvgMarkers.svelte';

	export let getLonLat;
	export let height;
	export let items;
	export let map;
	export let projectFn;
	export let width;
</script>

<svg class='SvgLayers' {width} {height}>
	<SvgMarkers
		{getLonLat}
		{items}
		{map}
		{projectFn}
	/>
</svg>

<style>
	svg {
		position: absolute;
	}
</style>
