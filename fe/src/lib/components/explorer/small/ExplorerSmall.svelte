<script>
	import OrgBanner from '$lib/components/banners/OrgBanner.svelte';
	import TopicBanner from '$lib/components/banners/TopicBanner.svelte';
	import Mapbox from '$lib/components/map/Mapbox.svelte';
	import SvgLayers from '$lib/components/map/SvgLayers.svelte';
	import OrgsList from '$lib/components/orgs/OrgsList.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
	import MessageView from '$lib/components/svizzle/MessageView.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {
		MAPBOXGL_ACCESSTOKEN as accessToken,
		MAPBOXGL_STYLEURL as styleURL,
		noOrgsMessage
	} from '$lib/config';
	import {
		_clusters,
		_keyPlaceLabelValueOrgsCount,
		_keyRegionLabelValueOrgsCount,
		_keyTopicIdValueOrgsCount,
		_orgs,
	} from '$lib/stores/data';
	import {_hero} from '$lib/stores/interaction';
	import {_activeViewId, setActiveView} from '$lib/stores/navigation';
	import {
		_activeTopicDetails,
		asyncUpdateTopicDetails,
	} from '$lib/stores/topics';
	import {getLonLat, getTopicLabel} from '$lib/utils/dataUtils';

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
					{accessToken}
					{getLonLat}
					{styleURL}
					CustomLayers={SvgLayers}
					items={$_clusters}
					withScaleControl={true}
					withZoomControl={true}
				/>
			</View>
			<View id='details'>
				{#if $_orgs.length > 0}
					<OrgsList items={$_orgs} />
				{:else}
					<MessageView
						fontSize='1rem'
						padding='10px'
						text={noOrgsMessage}
						textAlign='center'
					/>
				{/if}
			</View>
			<View id='topics'>
				<div class='scrollable'>
					<BarchartVDiv
						isInteractive={true}
						items={$_keyTopicIdValueOrgsCount}
						keyToLabelFn={getTopicLabel}
						message={noOrgsMessage}
						on:clicked={({detail: {id}}) => asyncUpdateTopicDetails(id)}
					/>
				</div>
			</View>
			<View id='places'>
				<div class='scrollable'>
					<BarchartVDiv
						items={$_keyPlaceLabelValueOrgsCount}
						message={noOrgsMessage}
					/>
				</div>
			</View>
			<View id='regions'>
				<div class='scrollable'>
					<BarchartVDiv
						items={$_keyRegionLabelValueOrgsCount}
						message={noOrgsMessage}
					/>
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
</style>
