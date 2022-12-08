<script>
	import {CheckCircle, Edit3, Icon} from '@svizzle/ui';

	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
	import {_keyPlaceIdValueOrgsCount} from '$lib/stores/data';
	import {_placeIdToLabel} from '$lib/stores/dataset';
	import {_isSmallScreen} from '$lib/stores/layout';
	import {
		_isPlacesEditMode,
		_selectedPlaceIds,
		enterPlacesEditMode,
		exitPlacesEditMode,
		togglePlaceId,
	} from '$lib/stores/selection';
	import {_barchartsTheme} from '$lib/stores/theme';

	const toggleItem = ({detail: {id}}) => togglePlaceId(id);

	const onKeyDown = event => {
		if ($_isPlacesEditMode && event.keyCode === 27) {
			event.preventDefault();
			exitPlacesEditMode();
		}
	}

	$: onClick = $_isPlacesEditMode ? toggleItem : null;
</script>

<svelte:window on:keydown={onKeyDown} />

<div
	class='PlacesBar'
	class:small={$_isSmallScreen}
>
	<div class='editMode'>
		<button on:click={$_isPlacesEditMode ? exitPlacesEditMode : enterPlacesEditMode}>
			<span>
				<Icon
					glyph={$_isPlacesEditMode ? CheckCircle : Edit3}
					strokeWidth=1.25
				/>
			</span>
			<span>{$_isPlacesEditMode ? 'Exit' : 'Enter'} edit mode</span>
		</button>
	</div>
	<div class='select'>
		<BarchartVDiv
			isInteractive={$_isPlacesEditMode}
			items={$_keyPlaceIdValueOrgsCount}
			keyToLabelFn={$_placeIdToLabel}
			on:clicked={onClick}
			selectedKeys={$_selectedPlaceIds}
			theme={$_barchartsTheme}
		/>
	</div>
</div>

<style>
	.PlacesBar {
		display: grid;
		grid-auto-flow: row;
		grid-template-areas: 'editMode' 'select';
		grid-template-columns: 100%;
		grid-template-rows: min-content 1fr;
		height: 100%;
		overflow-y: auto;
		width: 100%;
	}
	.small.PlacesBar {
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
		outline-offset: calc(var(--focusLineWidth) * -1);
	}
</style>
