<script>
	import OrgsList from '$lib/components/orgs/OrgsList.svelte';
	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
	import MessageView from '$lib/components/svizzle/MessageView.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {noOrgsMessage} from '$lib/config';
	import {
		_keyPlaceLabelValueOrgsCount,
		_keyRegionLabelValueOrgsCount,
		_keyTopicIdValueOrgsCount,
		_orgs,
	} from '$lib/stores/data';
	import {_activeViewId, setActiveView} from '$lib/stores/navigation';
	import {
		asyncUpdateTopicDetails,
		clearActiveTopic
	} from '$lib/stores/topics';
	import {getTopicLabel} from '$lib/utils/dataUtils';

	import MultiviewSelector from './MultiviewSelector.svelte';
</script>

<div class='Multiview'>
	<div class='slider'>
		<ViewsXor viewId={$_activeViewId}>
			<View id='details'>
				{#if $_orgs && $_orgs.length > 0}
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
						on:entered={({detail: {id}}) => asyncUpdateTopicDetails(id)}
						on:exited={clearActiveTopic}
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
		<MultiviewSelector
			activeViewId={$_activeViewId}
			setView={setActiveView}
		/>
	</div>
</div>

<style>
	.Multiview {
		display: grid;
		grid-auto-flow: row;
		grid-template-rows: 1fr min-content;
		grid-template-columns: 100%;
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
