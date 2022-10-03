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

	$: onClick = $_isPlacesEditMode ? toggleItem : null;
</script>

<div
	class='PlacesBar'
	class:small={$_isSmallScreen}
>
	<div class='editMode'>
		{#if $_isPlacesEditMode}
			<div
				class='button'
				on:click={exitPlacesEditMode}
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
				on:click={enterPlacesEditMode}
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

	.button {
		align-items: center;
		cursor: pointer;
		display: flex;
		gap: 1rem;
		justify-content: center;
		user-select: none;
	}
</style>
