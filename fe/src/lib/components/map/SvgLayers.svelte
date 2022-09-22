<script>
	import Shield from './Shield.svelte';
	import SvgMarkers from './SvgMarkers.svelte';

	export let getLonLat;
	export let height;
	export let items;
	export let map;
	export let projectFn;
	export let width;
</script>

<div class='Layers'>
	<Shield />
	<svg class='SvgLayers' {width} {height}>
		<SvgMarkers
			{getLonLat}
			{items}
			{map}
			{projectFn}
		/>
	</svg>
</div>

<style>
	.Layers {
		position: absolute;
		width: 100%;
		height: 100%;
	}
	svg {
		position: absolute;
		pointer-events: none;
	}
</style>
