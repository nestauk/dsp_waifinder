<script>
	import {
		CustomControl,
		Mapbox,
		SvgLayer
	} from '@svizzle/mapbox';
	import {Pill, View, ViewsXor} from '@svizzle/ui';

	import OrgBanner from '$lib/components/explorer/banners/OrgBanner.svelte';
	import TopicBanner from '$lib/components/explorer/banners/TopicBanner.svelte';
	import SvgMarkers from '$lib/components/explorer/map/SvgMarkers.svelte';
	import OrgsList from '$lib/components/explorer/orgs/OrgsList.svelte';
	import PlacesBar from '$lib/components/explorer/PlacesBar.svelte';
	import RegionsBar from '$lib/components/explorer/RegionsBar.svelte';
	import TopicsBar from '$lib/components/explorer/TopicsBar.svelte';
	import Settings from '$lib/components/explorer/Settings.svelte';
	import ToggleControl from '$lib/components/svizzle/ToggleControl.svelte';
	import {
		MAPBOXGL_ACCESSTOKEN as accessToken,
		MAPBOXGL_STYLEURLs as styleURLs,
		noOrgsMessage
	} from '$lib/config.js';
	import {
		_allOrgsBBox,
		_clusters,
		_orgs,
	} from '$lib/stores/data.js';
	import {_autoZoom, _hero, clearHero} from '$lib/stores/interaction.js';
	import {_activeViewId, setActiveView} from '$lib/stores/navigation.js';
	import {_bbox_WS_EN, _bbox_WSEN, _zoom} from '$lib/stores/selection.js';
	import {_pillTheme, _themeName} from '$lib/stores/theme.js';
	import {_activeTopicDetails} from '$lib/stores/topics.js';
	import {getLonLat} from '$lib/utils/dataUtils.js';

	import ViewSelector from './ViewSelector.svelte';
</script>

<div class='ExplorerSmall'>
	<div class='slider'>
		<ViewsXor viewId={$_activeViewId}>
			<View id='settings'>
				<Settings />
			</View>
			<View id='map'>
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

					<CustomControl position='bottom-left'>
						<ToggleControl
							bind:checked={$_autoZoom}
							title='Auto zoom'
						/>
					</CustomControl>

				</Mapbox>
				{#if $_orgs.length === 0}
					<div class='noOrgsMessage'>
						<Pill
							label={noOrgsMessage}
							theme={$_pillTheme}
						/>
					</div>
				{/if}
			</View>
			<View id='details'>
				{#if $_orgs.length > 0}
					<OrgsList items={$_orgs} />
				{:else}
					<div class='noOrgsMessage'>
						<Pill
							label={noOrgsMessage}
							theme={$_pillTheme}
						/>
					</div>
				{/if}
			</View>
			<View id='topics'>
				<div class='scrollable'>
					{#if $_orgs.length > 0}
						<TopicsBar />
					{:else}
						<div class='noOrgsMessage'>
							<Pill
								label={noOrgsMessage}
								theme={$_pillTheme}
							/>
							<!-- TBD unify `nowrap` prop for Pills -->
						</div>
					{/if}
				</div>
			</View>
			<View id='places'>
				<div class='scrollable'>
					{#if $_orgs.length > 0}
						<PlacesBar />
					{:else}
						<div class='noOrgsMessage'>
							<Pill
								label={noOrgsMessage}
								theme={$_pillTheme}
							/>
						</div>
					{/if}
				</div>
			</View>
			<View id='regions'>
				<div class='scrollable'>
					{#if $_orgs.length > 0}
						<RegionsBar />
					{:else}
						<div class='noOrgsMessage'>
							<Pill
								label={noOrgsMessage}
								theme={$_pillTheme}
							/>
						</div>
					{/if}
				</div>
			</View>
		</ViewsXor>
	</div>
	<div>
		<ViewSelector
			setView={setActiveView}
			activeViewId={$_activeViewId}
		/>
	</div>

	{#if $_hero?.isVisible}
		<OrgBanner />
	{/if}

	{#if $_activeTopicDetails}
		<TopicBanner
			hasBackdrop={true}
			isPinned={true}
		/>
	{/if}
</div>

<style>
	.ExplorerSmall {
		display: grid;
		grid-auto-flow: row;
		grid-template-rows: 1fr min-content;
		height: 100%;
	}
	.slider {
		height: 100%;
		overflow: hidden;
	}

	/* TBD */
	.scrollable {
		height: 100%;
		overflow: auto;
	}
	.noOrgsMessage {
		align-content: center;
		display: grid;
		height: 100%;
		justify-content: center;
		padding: 0.5em;
		pointer-events: none;
		position: absolute;
		top: 0;
		width: 100%;
	}
</style>
