<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {CheckCircle, Edit3, Icon} from '@svizzle/ui';

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
	import {getWikipediaURL} from '$lib/utils/dbpedia';

	const toggleItem = ({detail: {key}}) => toggleTopicId(key);
	const navigate = ({detail: {key}}) => {
		window.location = getWikipediaURL(key);
	}

	const onKeyDown = event => {
		if ($_isTopicsEditMode && event.keyCode === 27) {
			event.preventDefault();
			exitTopicsEditMode();
		}
	}

	$: onClick = $_isTopicsEditMode ? toggleItem : navigate;
	$: onEntered = $_isSmallScreen
		? null
		: ({detail: {key}}) => asyncUpdateTopicDetails(key);
</script>

<svelte:window on:keydown={onKeyDown} />

<div
	class='TopicsBar'
	class:small={$_isSmallScreen}
>
	<div class='editMode'>
		<button on:click={$_isTopicsEditMode ? exitTopicsEditMode : enterTopicsEditMode}>
			<span>
				<Icon
					glyph={$_isTopicsEditMode ? CheckCircle : Edit3}
					strokeWidth=1.25
				/>
			</span>
			<span>{$_isTopicsEditMode ? 'Confirm selection' : 'Select topics'}</span>
		</button>
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

	button {
		align-items: center;
		background: var(--colorBackground);
		border: none;
		color: var(--colorText);
		cursor: pointer;
		display: flex;
		font-size: 1rem;
		gap: 1em;
		justify-content: center;
		user-select: none;
		width: 100%;
	}
	button:focus {
		outline: none;
	}
	.editMode:focus-within {
		outline: var(--outline);
		outline-offset: calc(var(--outlineWidth) * -1);
	}
</style>
