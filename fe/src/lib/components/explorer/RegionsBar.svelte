<script>
	import {CheckCircle, Edit3, Icon} from '@svizzle/ui';

	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
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
	import {_currThemeVars} from '$lib/stores/theme';

	const toggleItem = ({detail: {id}}) => toggleRegionId(id);

	$: onClick = $_isRegionsEditMode ? toggleItem : null;
</script>

<div
	class='RegionsBar'
	class:small={$_isSmallScreen}
>
	<div class='editMode'>
		{#if $_isRegionsEditMode}
			<div
				class='button'
				on:click={exitRegionsEditMode}
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
				on:click={enterRegionsEditMode}
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
			isInteractive={$_isRegionsEditMode}
			items={$_keyRegionIdValueOrgsCount}
			keyToLabelFn={$_regionIdToLabel}
			on:clicked={onClick}
			selectedKeys={$_selectedRegionIds}
			theme={{
				deselectedOpacity: 1,
				selectedKeyBackgroundColor: $_currThemeVars['--colorSelectedLight'],
			}}
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
		border-bottom: 1px solid lightgrey;
		grid-area: editMode;
		padding: 0.75rem;
	}
	.select {
		grid-area: select;
		overflow: hidden;
	}
	.small .editMode {
		border-top: 1px solid lightgrey;
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
