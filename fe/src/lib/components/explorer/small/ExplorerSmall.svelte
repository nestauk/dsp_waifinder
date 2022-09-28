<script>
	import OrgBanner from '$lib/components/banners/OrgBanner.svelte';
	import TopicBanner from '$lib/components/banners/TopicBanner.svelte';
	import AutoZoomControl from '$lib/components/map/AutoZoomControl.svelte';
	import Mapbox from '$lib/components/map/Mapbox.svelte';
	import SvgLayers from '$lib/components/map/SvgLayers.svelte';
	import OrgsList from '$lib/components/orgs/OrgsList.svelte';
	import Pill from '$lib/components/orgs/Pill.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {
		MAPBOXGL_ACCESSTOKEN as accessToken,
		MAPBOXGL_STYLEURL as styleURL,
		noOrgsMessage
	} from '$lib/config';
	import {
		_allOrgsBBox,
		_clusters,
		_keyPlaceLabelValueOrgsCount,
		_keyRegionLabelValueOrgsCount,
		_keyTopicIdValueOrgsCount,
		_orgs,
	} from '$lib/stores/data';
	import {_autoZoom, _hero} from '$lib/stores/interaction';
	import {_activeViewId, setActiveView} from '$lib/stores/navigation';
	import {
		_activeTopicDetails,
		asyncUpdateTopicDetails,
	} from '$lib/stores/topics';
	import {getLonLat, getTopicLabel} from '$lib/utils/dataUtils';

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
					{styleURL}
					bounds={$_allOrgsBBox}
					customControl={{
						control: AutoZoomControl,
						position: 'bottom-left'
					}}
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
						<BarchartVDiv
							isInteractive={true}
							items={$_keyTopicIdValueOrgsCount}
							keyToLabelFn={getTopicLabel}
							message={noOrgsMessage}
							on:clicked={({detail: {id}}) => asyncUpdateTopicDetails(id)}
						/>
					{:else}
						<div class='noOrgsMessage'>
							<Pill label={noOrgsMessage} />
						</div>
					{/if}
				</div>
			</View>
			<View id='places'>
				<div class='scrollable'>
					{#if $_orgs.length > 0}
						<BarchartVDiv
							items={$_keyPlaceLabelValueOrgsCount}
						/>
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
						<BarchartVDiv
							items={$_keyRegionLabelValueOrgsCount}
						/>
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
			hasBackground={true}
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
