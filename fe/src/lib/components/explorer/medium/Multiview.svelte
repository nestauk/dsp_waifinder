<script>
	import {Pill, View, ViewsXor} from '@svizzle/ui';

	import OrgsList from '$lib/components/explorer/orgs/OrgsList.svelte';
	import PlacesBar from '$lib/components/explorer/PlacesBar.svelte';
	import RegionsBar from '$lib/components/explorer/RegionsBar.svelte';
	import TopicsBar from '$lib/components/explorer/TopicsBar.svelte';
	import {noOrgsMessage} from '$lib/config.js';
	import {_orgs} from '$lib/stores/data.js';
	import {_activeViewId, setActiveView} from '$lib/stores/navigation.js';
	import {_pillTheme} from '$lib/stores/theme.js';

	import MultiviewSelector from './MultiviewSelector.svelte';
</script>

<div class='Multiview'>
	<div class='slider'>
		<ViewsXor viewId={$_activeViewId}>
			<View id='details'>
				{#if $_orgs.length > 0}
					<OrgsList items={$_orgs} />
				{:else}
					<div class='noOrgsMessage'>
						<Pill
							label={noOrgsMessage}
							nowrap={false}
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
								nowrap={false}
								theme={$_pillTheme}
							/>
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
								nowrap={false}
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
								nowrap={false}
								theme={$_pillTheme}
							/>
						</div>
					{/if}
				</div>
			</View>
		</ViewsXor>
	</div>
	<div class='tabs'>
		<MultiviewSelector
			activeViewId={$_activeViewId}
			setView={setActiveView}
		/>
	</div>
</div>

<style>
	.Multiview {
		border-left: var(--border);
		display: grid;
		grid-auto-flow: row;
		grid-template-columns: 100%;
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
