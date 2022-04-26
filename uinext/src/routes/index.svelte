<script>
	import mapboxgl from 'mapbox-gl';
	import {
		MAPBOXGL_ACCESSTOKEN as accessToken,
		MAPBOXGL_STYLEURL as styleURL
	} from 'app/config';
	import Map from 'app/components/Map/Map.svelte';
	import MapboxglUnsupported from 'app/components/Map/MapboxglUnsupported.svelte';

	const withScaleControl = false;
	const withZoomControl = true;
	const isMapboxGLSupported = mapboxgl.supported();
</script>

{#if isMapboxGLSupported}
	<Map
		{accessToken}
		{styleURL}
		{withScaleControl}
		{withZoomControl}
	/>
{:else}
	<MapboxglUnsupported />
{/if}
