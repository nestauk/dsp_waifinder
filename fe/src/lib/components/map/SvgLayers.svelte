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
	.SvgLayers {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
