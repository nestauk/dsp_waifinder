<script>
	import mapboxgl from 'mapbox-gl';

	import MapboxglBase from './MapboxglBase.svelte';
	import MapboxglUnsupported from './MapboxglUnsupported.svelte';

	const isMapboxGLSupported = mapboxgl.supported();

	export let accessToken;
	export let bounds;
	export let customControl;
	export let CustomLayers;
	export let getLonLat;
	export let items = [];
	export let styleURL;
	export let withScaleControl = true;
	export let withZoomControl = true;

</script>

{#if isMapboxGLSupported}
	<MapboxglBase
		{accessToken}
		{bounds}
		{customControl}
		{CustomLayers}
		{getLonLat}
		{items}
		{styleURL}
		{withScaleControl}
		{withZoomControl}
		on:bboxChanged
	/>
{:else}
	<MapboxglUnsupported />
{/if}
