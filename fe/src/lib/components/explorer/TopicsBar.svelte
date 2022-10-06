<script>
	import {CheckCircle, Edit3, Icon} from '@svizzle/ui';

	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
	import {_keyTopicIdValueOrgsCount} from '$lib/stores/data';
	import {_isSmallScreen} from '$lib/stores/layout';
	import {
		_isTopicsEditMode,
		_selectedTopicIds,
		enterTopicsEditMode,
		exitTopicsEditMode,
		toggleTopicId,
	} from '$lib/stores/selection';
	import {_barchartsTheme} from '$lib/stores/theme';
	import {
		asyncUpdateTopicDetails,
		clearActiveTopic
	} from '$lib/stores/topics';
	import {getTopicLabel} from '$lib/utils/dataUtils';

	const toggleItem = ({detail: {id}}) => toggleTopicId(id);

	$: onClick = $_isTopicsEditMode ? toggleItem : null;
	$: onEntered = $_isSmallScreen
		? null
		: ({detail: {id}}) => asyncUpdateTopicDetails(id);
</script>

<div
	class='TopicsBar'
	class:small={$_isSmallScreen}
>
	<div class='editMode'>
		{#if $_isTopicsEditMode}
			<div
				class='button'
				on:click={exitTopicsEditMode}
			>
				<span>
					<Icon
						glyph={CheckCircle}
						strokeWidth=1.25
					/>
				</span>
				<span>Exit edit mode</span>
			</div>
		{:else}
			<div
				class='button'
				on:click={enterTopicsEditMode}
			>
				<span>
					<Icon
						glyph={Edit3}
						strokeWidth=1.25
					/>
				</span>
				<span>Enter edit mode</span>
			</div>
		{/if}
	</div>
	<div class='select'>
		<!-- FIXME pointer cursor because it's interactive but it shouldn't if not in edit mode -->
		<BarchartVDiv
			isInteractive={true}
			items={$_keyTopicIdValueOrgsCount}
			keyToLabelFn={getTopicLabel}
			on:clicked={onClick}
			on:entered={onEntered}
			on:exited={clearActiveTopic}
			selectedKeys={$_selectedTopicIds}
			theme={$_barchartsTheme}
		/>
	</div>
</div>

<style>
	.TopicsBar {
		display: grid;
		grid-auto-flow: row;
		grid-template-areas: 'editMode' 'select';
		grid-template-columns: 100%;
		grid-template-rows: min-content 1fr;
		height: 100%;
		overflow-y: auto;
		width: 100%;
	}
	.small.TopicsBar {
		grid-template-rows: 1fr min-content;
		grid-template-areas: 'select' 'editMode';
	}

	.editMode,
	.select {
		height: 100%;
		width: 100%;
	}
	.editMode {
		border-bottom: var(--border);
		grid-area: editMode;
		padding: 0.75rem;
	}
	.select {
		grid-area: select;
		overflow: hidden;
	}
	.small .editMode {
		border-top: var(--border);
	}

	.button {
		align-items: center;
		cursor: pointer;
		display: flex;
		gap: 1rem;
		justify-content: center;
		user-select: none;
	}
</style>
