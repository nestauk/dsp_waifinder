<script>
	import OrgBanner from '$lib/components/banners/OrgBanner.svelte';
	import TopicBanner from '$lib/components/banners/TopicBanner.svelte';
	import Mapbox from '$lib/components/map/Mapbox.svelte';
	import AutoZoomControl from '$lib/components/map/AutoZoomControl.svelte';
	import SvgLayers from '$lib/components/map/SvgLayers.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import {
		MAPBOXGL_ACCESSTOKEN as accessToken,
		MAPBOXGL_STYLEURL as styleURL
	} from '$lib/config';
	import {_allOrgsBBox, _clusters, _mapBounds} from '$lib/stores/data';
	import {getLonLat} from '$lib/utils/dataUtils';
	import {
		_autoZoom,
		_hero,
		clearInteractionStores,
		clearIsCursorOnMap,
		setIsCursorOnMap
	} from '$lib/stores/interaction';
	import {_activeTopicDetails} from '$lib/stores/topics';

	import Multiview from './Multiview.svelte';

	const disableAutoZoom = () => {
		$_autoZoom = false;
	}

	$: $_autoZoom && ($_mapBounds = $_allOrgsBBox);
</script>

<svelte:body on:mouseleave={clearInteractionStores} />

<div class='ExplorerMedium'>
	<div>
		<Settings />
	</div>
	<div
		on:mouseenter={setIsCursorOnMap}
		on:mouseleave={clearIsCursorOnMap}
	>
		<Mapbox
			bounds={$_mapBounds}
			{accessToken}
			{getLonLat}
			{styleURL}
			customControl={{
				control: AutoZoomControl,
				position: 'top-left'
			}}
			CustomLayers={SvgLayers}
			items={$_clusters}
			on:bboxChanged={disableAutoZoom}
			withScaleControl={true}
			withZoomControl={true}
		/>
		{#if $_activeTopicDetails}
			<TopicBanner isPinned={false} />
		{/if}
	</div>
	<div>
		<Multiview />
		{#if $_hero?.isVisible}
			<OrgBanner />
		{/if}
	</div>
</div>

<style>
	.ExplorerMedium {
		display: grid;
		grid-template-columns: 20% 45% 35%;
		height: 100%;
		width: 100%;
	}
	.ExplorerMedium > div {
		max-height: 100%;
		overflow: hidden;
		position: relative;
	}
</style>
