<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {
		Download,
		Icon,
		Input,
		Switch,
		Tag,
		XCircle,
	} from '@svizzle/ui';

	import City from '$lib/components/explorer/icons/City.svelte';
	import Region from '$lib/components/explorer/icons/Region.svelte';
	import {
		_keyOrgTypeValueOrgsCount,
		_orgsCount,
		_selectedPlaces,
		_selectedRegions,
	} from '$lib/stores/data.js';
	import {
		_hasSelectedPlaces,
		_hasSelectedRegions,
		_hasSelectedTopics,
		_orgSearchValue,
		_orgTypesSelectionMode,
		_placesSearchValue,
		_selectedOrgTypes,
		_selectedTopicIds,
		deselectAllPlaces,
		deselectAllRegions,
		deselectAllTopics,
		deselectPlace,
		deselectRegion,
		deselectTopic,
		orgTypesSelectionModes,
		toggleOrgType,
		toggleOrgTypesSelectionMode,
	} from '$lib/stores/selection.js';
	import {
		_barchartsTheme,
		_currThemeVars,
		_orgTypeToColorFn,
	} from '$lib/stores/theme.js';
	import {getTopicLabel} from '$lib/utils/dataUtils.js';
	import {
		getResultsCsv,
		getResultsMetadata,
		initiateZippedDownload,
	} from '$lib/utils/download.js';

	const toggledOrgType = ({detail: {key}}) => toggleOrgType(key);

	/* download results */

	const onClickDownload = () => {
		const {filename, filtersString} = getResultsMetadata();
		const resultsCsv = getResultsCsv();

		initiateZippedDownload(filename, {
			'results.csv': resultsCsv,
			'filters.json': filtersString,
		});
	}

	$: multipleSelectedPlaces = $_selectedPlaces.length > 1;
	$: placesHeaderEnd = multipleSelectedPlaces ? 's' : '';
	$: placesHeaderStart = $_selectedPlaces.length || 'No';

	$: multipleSelectedRegions = $_selectedRegions.length > 1;
	$: regionsHeaderEnd = multipleSelectedRegions ? 's' : '';
	$: regionsHeaderStart = $_selectedRegions.length || 'No';

	$: multipleSelectedTopics = $_selectedTopicIds.length > 1;
	$: topicsHeaderEnd = multipleSelectedTopics ? 's' : '';
	$: topicsHeaderStart = $_selectedTopicIds.length || 'No';

	$: switchTheme = {
		backgroundColor: $_currThemeVars['--colorBackground'],
		color: $_currThemeVars['--colorText'],
		knobColor: $_currThemeVars['--colorSwitchKnob'],
		outlineColor: $_currThemeVars['--colorOutline'],
		outlineStyle: $_currThemeVars['--outlineStyle'],
		outlineWidth: $_currThemeVars['--outlineWidth'],
	}
	$: textSearchInputTheme = {
		colorText: $_currThemeVars['--colorText'],
		colorIcon: $_orgSearchValue
			? $_currThemeVars['--colorIcon']
			: $_currThemeVars['--colorBackground'],
		outline: $_currThemeVars['--outline']
	}
	$: placeSearchInputTheme = {
		colorText: $_currThemeVars['--colorText'],
		colorIcon: $_placesSearchValue
			? $_currThemeVars['--colorIcon']
			: $_currThemeVars['--colorBackground'],
		outline: $_currThemeVars['--outline']
	}

	const makeOnKeyDown = (func, id) => event => {
		if (['Enter', ' '].includes(event.key)) {
			event.preventDefault();
			func(id);
		}
	}
</script>

<div class='Settings'>

	<!-- Results / Search -->

	<div class='panel'>

		<!-- Results -->

		<header>
			<div class='sectionHeader'>{$_orgsCount} organisations </div>
			<button
				aria-label='Download selected results'
				on:click={onClickDownload}
				title='Download selected results'
			>
				<Icon
					glyph={Download}
					size=16
					stroke={$_currThemeVars['--colorLink']}
				/>
			</button>
		</header>


		<div class='group'>

			<!-- Text Search -->

			<div class='item'>
				<Input
					bind:value={$_orgSearchValue}
					placeholder='search name or description'
					theme={textSearchInputTheme}
				/>
			</div>

			<!-- Place Search -->

			<div class='item'>
				<Input
					bind:value={$_placesSearchValue}
					placeholder='search place name'
					theme={placeSearchInputTheme}
				/>
			</div>
		</div>
	</div>

	<!-- Org types -->

	<div class='panel'>
		<header>
			<div class='sectionHeader'>Org types</div>
		</header>

		<div class='group'>
			<div class='item'>
				<BarchartVDiv
					isInteractive={true}
					items={$_keyOrgTypeValueOrgsCount}
					keyToColorFn={$_orgTypeToColorFn}
					on:clicked={toggledOrgType}
					selectedKeys={$_selectedOrgTypes}
					theme={{
						...$_barchartsTheme,
						hoverColorBar: null,
						padding: 0,
					}}
				/>
			</div>
			<div class='item'>
				<Switch
					on:toggled={toggleOrgTypesSelectionMode}
					theme={switchTheme}
					value={$_orgTypesSelectionMode}
					values={orgTypesSelectionModes}
				/>
			</div>
		</div>
	</div>

	<!-- Selected topics -->

	<div class='panel'>
		<header>
			<div class='sectionHeader'>{topicsHeaderStart} selected topic{topicsHeaderEnd}</div>
		</header>

		{#if $_hasSelectedTopics}

			<!-- selected topics -->

			<div class='item'>
				<div class='stack'>
					{#each $_selectedTopicIds as id}
						<div
							class='clickable row selectedItem'
							on:click={() => deselectTopic(id)}
							on:keydown={makeOnKeyDown(deselectTopic, id)}
						>
							<span class='label'>{getTopicLabel(id)}</span>
							<button>
								<Icon
									glyph={XCircle}
									strokeWidth=1.25
									stroke={$_currThemeVars['--colorIcon']}
								/>
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- deselect all -->

			{#if multipleSelectedTopics}
				<div class='item'>
					<div class='row deselectAll'>
						<span>Deselect all</span>
						<button
							class='clickable'
							on:click={deselectAllTopics}
						>
							<Icon
								glyph={XCircle}
								stroke={$_currThemeVars['--colorIcon']}
							/>
						</button>
					</div>
				</div>
			{/if}

		{:else}

			<!-- tip -->

			<div class='item'>
				<span>
					<Icon
						glyph={Tag}
						stroke={$_currThemeVars['--colorIcon']}
					/>
				</span>
				<span class='tip'>To select topics, please head to the Topics bar, enter edit mode and click on items</span>
			</div>

		{/if}

	</div>

	<!-- Selected places -->

	<div class='panel'>

		<header>
			<div class='sectionHeader'>{placesHeaderStart} selected place{placesHeaderEnd}</div>
		</header>

		{#if $_hasSelectedPlaces}

			<!-- selected places -->

			<div class='item'>
				<div class='stack'>
					{#each $_selectedPlaces as {id, name}}
						<div
							class='clickable row selectedItem'
							on:click={() => deselectPlace(id)}
							on:keydown={makeOnKeyDown(deselectPlace, id)}
						>
							<span class='label'>{name}</span>
							<button>
								<Icon
									glyph={XCircle}
									strokeWidth=1.25
									stroke={$_currThemeVars['--colorIcon']
								}
								/>
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- deselect all -->

			{#if multipleSelectedPlaces}
				<div class='item'>
					<div class='row deselectAll'>
						<span>Deselect all</span>
						<button
							class='clickable'
							on:click={deselectAllPlaces}
						>
							<Icon
								glyph={XCircle}
								stroke={$_currThemeVars['--colorIcon']}
							/>
						</button>
					</div>
				</div>
			{/if}

		{:else}

			<!-- tip -->

			<div class='item'>
				<span>
					<Icon
						fill={$_currThemeVars['--colorIcon']}
						glyph={City}
						stroke='none'
					/>
				</span>
				<span class='tip'>To select places, please head to the Places bar, enter edit mode and click on items</span>
			</div>
		{/if}

	</div>

	<!-- Selected regions -->

	<div class='panel'>

		<header>
			<div class='sectionHeader'>{regionsHeaderStart} selected region{regionsHeaderEnd}</div>
		</header>

		{#if $_hasSelectedRegions}

			<!-- selected regions -->

			<div class='item'>
				<div class='stack'>
					{#each $_selectedRegions as {id, name}}
						<div
							class='clickable row selectedItem'
							on:click={() => deselectRegion(id)}
							on:keydown={makeOnKeyDown(deselectRegion, id)}
						>
							<span class='label'>{name}</span>
							<button>
								<Icon
									glyph={XCircle}
									stroke={$_currThemeVars['--colorIcon']}
									strokeWidth=1.25
								/>
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- deselect all -->

			{#if multipleSelectedRegions}
				<div class='item'>
					<div class='row deselectAll'>
						<span>Deselect all</span>
						<button
							class='clickable'
							on:click={deselectAllRegions}
						>
							<Icon
								glyph={XCircle}
								stroke={$_currThemeVars['--colorIcon']}
							/>
						</button>
					</div>
				</div>
			{/if}

		{:else}

			<!-- tip -->

			<div class='item'>
				<span>
					<Icon
						glyph={Region}
						stroke={$_currThemeVars['--colorIcon']}
					/>
				</span>
				<span class='tip'>To select some regions, please head to the Regions bar, enter edit mode and click on items</span>
			</div>
		{/if}

	</div>

</div>

<style>
	.Settings {
		border-right: var(--border);
		height: 100%;
		overflow-y: auto;
		padding: 1em;
		width: 100%;
	}

	.panel:not(:last-child) {
		border-bottom: var(--border);
		margin-bottom: 1em;
		padding-bottom: 1em;
	}
	.panel header {
		align-items: center;
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: 1fr;
		margin-bottom: 0.7em;
	}

	.sectionHeader {
		font-size: 1.2em;
		margin: 0;
	}

	button {
		background: none;
		border: none;
		cursor: pointer;
	}
	button:focus-visible {
		outline: var(--outline);
	}

	.group {
		display: flex;
		flex-direction: column;
		row-gap: 0.5em;
	}

	.item {
		align-items: center;
		display: flex;
		gap: 1em;
		justify-content: center;
	}

	.stack {
		width: 100%;
	}

	.row {
		align-items: center;
		display: flex;
		gap: 0.5rem;
		height: 100%;
		padding: 0.25rem 0;
		width: 100%;
	}
	.selectedItem {
		justify-content: space-between;
	}
	.selectedItem:hover, .selectedItem:focus-within {
		background-color: var(--colorHoverToDelete);
	}
	.deselectAll {
		justify-content: end;
	}
	.tip {
		justify-content: start;
	}

	.label {
		flex: 1;
	}
	.clickable {
		cursor: pointer;
	}
</style>
