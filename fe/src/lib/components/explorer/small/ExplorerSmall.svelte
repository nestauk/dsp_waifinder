<script>
	import OrgBanner from '$lib/components/banners/OrgBanner.svelte';
	import TopicBanner from '$lib/components/banners/TopicBanner.svelte';
	import PlacesBar from '$lib/components/explorer/PlacesBar.svelte';
	import RegionsBar from '$lib/components/explorer/RegionsBar.svelte';
	import TopicsBar from '$lib/components/explorer/TopicsBar.svelte';
	import AutoZoomControl from '$lib/components/map/AutoZoomControl.svelte';
	import Mapbox from '$lib/components/map/Mapbox.svelte';
	import SvgLayers from '$lib/components/map/SvgLayers.svelte';
	import OrgsList from '$lib/components/orgs/OrgsList.svelte';
	import Pill from '$lib/components/orgs/Pill.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {
		MAPBOXGL_ACCESSTOKEN as accessToken,
		MAPBOXGL_STYLEURLs as styleURLs,
		noOrgsMessage
	} from '$lib/config';
	import {
		_allOrgsBBox,
		_clusters,
		_orgs,
	} from '$lib/stores/data';
	import {_autoZoom, _hero} from '$lib/stores/interaction';
	import {_activeViewId, setActiveView} from '$lib/stores/navigation';
	import {_themeName} from '$lib/stores/theme';
	import {_activeTopicDetails} from '$lib/stores/topics';
	import {getLonLat} from '$lib/utils/dataUtils';

	import ViewSelector from './ViewSelector.svelte';

	const disableAutoZoom = () => {
		$_autoZoom = false;
	}
</script>

<div class='ExplorerSmall'>
	<div class='slider'>
		<ViewsXor viewId={$_activeViewId}>
			<View id='settings'>
				<Settings />
			</View>
			<View id='map'>
				<Mapbox
					{accessToken}
					{getLonLat}
					bounds={$_allOrgsBBox}
					customControl={{
						control: AutoZoomControl,
						position: 'bottom-left'
					}}
					styleURL={styleURLs[$_themeName]}
					CustomLayers={SvgLayers}
					items={$_clusters}
					on:bboxChanged={disableAutoZoom}
					withScaleControl={true}
					withZoomControl={true}
				/>
				{#if $_orgs.length === 0}
					<div class='noOrgsMessage'>
						<Pill label={noOrgsMessage} />
					</div>
				{/if}
			</View>
			<View id='details'>
				{#if $_orgs.length > 0}
					<OrgsList items={$_orgs} />
				{:else}
					<div class='noOrgsMessage'>
						<Pill label={noOrgsMessage} />
					</div>
				{/if}
			</View>
			<View id='topics'>
				<div class='scrollable'>
					{#if $_orgs.length > 0}
						<TopicsBar />
					{:else}
						<div class='noOrgsMessage'>
							<Pill label={noOrgsMessage} />
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
							<Pill label={noOrgsMessage} />
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
							<Pill label={noOrgsMessage} />
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
