<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {CheckCircle, Edit3, Icon} from '@svizzle/ui';

	import {_keyRegionIdValueOrgsCount} from '$lib/stores/data';
	import {_regionIdToLabel} from '$lib/stores/dataset';
	import {_isSmallScreen} from '$lib/stores/layout';
	import {
		_isRegionsEditMode,
		_selectedRegionIds,
		enterRegionsEditMode,
		exitRegionsEditMode,
		toggleRegionId,
	} from '$lib/stores/selection';
	import {_barchartsTheme} from '$lib/stores/theme';

	const toggleItem = ({detail: {key}}) => toggleRegionId(key);

	const onKeyDown = event => {
		if ($_isRegionsEditMode && event.keyCode === 27) {
			event.preventDefault();
			exitRegionsEditMode();
		}
	}

	$: onClick = $_isRegionsEditMode ? toggleItem : null;
</script>

<svelte:window on:keydown={onKeyDown} />

<div
	class='RegionsBar'
	class:small={$_isSmallScreen}
>
	<div class='editMode'>
		<button on:click={$_isRegionsEditMode ? exitRegionsEditMode : enterRegionsEditMode}>
			<span>
				<Icon
					glyph={$_isRegionsEditMode ? CheckCircle : Edit3}
					strokeWidth=1.25
				/>
			</span>
			<span>{$_isRegionsEditMode ? 'Confirm selection' : 'Select regions'}</span>
		</button>
	</div>
	<div class='select'>
		<BarchartVDiv
			isInteractive={$_isRegionsEditMode}
			items={$_keyRegionIdValueOrgsCount}
			keyToLabelFn={$_regionIdToLabel}
			on:clicked={onClick}
			selectedKeys={$_selectedRegionIds}
			theme={$_barchartsTheme}
		/>
	</div>
</div>

<style>
	.RegionsBar {
		display: grid;
		grid-auto-flow: row;
		grid-template-areas: 'editMode' 'select';
		grid-template-columns: 100%;
		grid-template-rows: min-content 1fr;
		height: 100%;
		overflow-y: auto;
		width: 100%;
	}
	.small.RegionsBar {
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
