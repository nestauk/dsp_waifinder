<script>
	import mapboxgl from 'mapbox-gl';

	import MapboxglBase from './MapboxglBase.svelte';
	import MapboxglUnsupported from './MapboxglUnsupported.svelte';

	const isMapboxGLSupported = mapboxgl.supported();

	export let accessToken;
	export let bounds;
	export let CustomLayers;
	export let getLonLat;
	export let isMoveEnabled;
	export let items = [];
	export let styleURL;
	export let withScaleControl = true;
	export let withZoomControl = true;
</script>

{#if isMapboxGLSupported}
	<MapboxglBase
		{accessToken}
		{bounds}
		{CustomLayers}
		{getLonLat}
		{isMoveEnabled}
		{items}
		{styleURL}
		{withScaleControl}
		{withZoomControl}
	/>
{:else}
	<MapboxglUnsupported />
{/if}
