<script>
	import {
		CustomControl,
		Mapbox,
		SvgLayer
	} from '@svizzle/mapbox';

	import OrgBanner from '$lib/components/explorer/banners/OrgBanner.svelte';
	import TopicBanner from '$lib/components/explorer/banners/TopicBanner.svelte';
	import SvgMarkers from '$lib/components/explorer/map/SvgMarkers.svelte';
	import Settings from '$lib/components/explorer/Settings.svelte';
	import ToggleControl from '$lib/components/svizzle/ToggleControl.svelte';
	import {
		MAPBOXGL_ACCESSTOKEN as accessToken,
		MAPBOXGL_STYLEURLs as styleURLs
	} from '$lib/config';
	import {_allOrgsBBox, _clusters} from '$lib/stores/data';
	import {getLonLat} from '$lib/utils/dataUtils';
	import {
		_autoZoom,
		_hero,
		clearHero,
		clearInteractionStores,
		clearIsCursorOnMap,
		setIsCursorOnMap
	} from '$lib/stores/interaction';
	import {_bbox_WS_EN, _bbox_WSEN, _zoom} from '$lib/stores/selection';
	import {_themeName} from '$lib/stores/theme';
	import {_activeTopicDetails} from '$lib/stores/topics';

	import Multiview from './Multiview.svelte';
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
			{_bbox_WS_EN}
			{_bbox_WSEN}
			{_zoom}
			{accessToken}
			bounds={$_allOrgsBBox}
			on:bboxChanged
			on:mapClick={clearHero}
			style={styleURLs[$_themeName]}
			withScaleControl={true}
			withZoomControl={true}
		>
			<SvgLayer>
				<SvgMarkers
					{getLonLat}
					items={$_clusters}
				/>
			</SvgLayer>

			<CustomControl position='top-left'>
				<ToggleControl
					bind:checked={$_autoZoom}
					title='Auto zoom'
				/>
			</CustomControl>

		</Mapbox>
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
