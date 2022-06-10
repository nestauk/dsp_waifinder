<script>
	import {
		Download,
		Icon,
		Switch,
		XCircle,
	} from '@svizzle/ui';

	import City from '$lib/components/icons/City.svelte';
	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
	import Input from '$lib/components/svizzle/Input.svelte';
	import {
		_keyOrgTypeValueOrgsCount,
		_orgsCount,
		_selectedPlaces,
	} from '$lib/stores/data';
	import {
		_hasSelectedPlaces,
		_orgSearchValue,
		_orgTypesSelectionMode,
		_placesSearchValue,
		_selectedOrgTypes,
		deselectAllPlaces,
		deselectPlace,
		orgTypesSelectionModes,
		toggleOrgType,
		toggleOrgTypesSelectionMode,
	} from '$lib/stores/selection';
	import {_currThemeVars, _orgTypeToColorFn} from '$lib/stores/theme';
	import {
		getResultsCsv,
		getResultsMetadata,
		initiateZippedDownload,
	} from '$lib/utils/download';

	const toggledOrgType = ({detail: {id}}) => toggleOrgType(id);

	/* download results */

	const onClickDownload = () => {
		const {filename, filtersString} = getResultsMetadata();
		const resultsCsv = getResultsCsv();

		initiateZippedDownload(filename, {
			'results.csv': resultsCsv,
			'filters.json': filtersString,
		});
	}
</script>

<div class='Settings'>

	<!-- Results / Search -->

	<div class='panel'>

		<!-- Results -->

		<header>
			<h3>{$_orgsCount} organisations </h3>
			<button
				aria-label='Download selected results'
				title='Download selected results'
				on:click={onClickDownload}
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
					placeholder='search in name or description'
				/>
			</div>

			<!-- Place Search -->

			<div class='item'>
				<Input
					bind:value={$_placesSearchValue}
					placeholder='search in place name'
				/>
			</div>
		</div>
	</div>

	<!-- Org types -->

	<div class='panel'>
		<header>
			<h3>Org types</h3>
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
						padding: 0,
						selectedKeyBackgroundColor:
							$_currThemeVars['--colorSelectedLight'],
					}}
				/>
			</div>
			<div class='item'>
				<Switch
					value={$_orgTypesSelectionMode}
					values={orgTypesSelectionModes}
					on:toggled={toggleOrgTypesSelectionMode}
				/>
			</div>
		</div>
	</div>

	<!-- Selected places -->

	<div class='panel'>
		<header>
			<h3>{$_selectedPlaces.length || 'No'} selected places</h3>
		</header>

		{#if $_hasSelectedPlaces}

			<!-- selected places -->

			<div class='item'>
				<div class='stack'>
					{#each $_selectedPlaces as {id, name}}
						<div
							class='clickable row selectedItem'
							on:click={() => deselectPlace(id)}
						>
							<span class='label'>{name}</span>
							<span>
								<Icon
									glyph={XCircle}
									strokeWidth=1.25
								/>
							</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- deselect all -->

			<div class='item'>
				<div class='row deselectAll'>
					<span>Deselect all</span>
					<span
						class='clickable'
						on:click={deselectAllPlaces}
					>
						<Icon glyph={XCircle} />
					</span>
				</div>
			</div>
		{:else}
			<div class='item'>
				<span>
					<Icon
						fill='black'
						glyph={City}
						stroke='none'
					/>
				</span>
				<span class='tip'>To select some places, please head to the Places bar, enter edit mode and click on items</span>
			</div>
		{/if}

	</div>

</div>

<style>
	.Settings {
		height: 100%;
		overflow-y: auto;
		padding: 1em;
		width: 100%;
	}

	.panel:not(:last-child) {
		border-bottom: 1px solid lightgrey;
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

	h3 {
		margin: 0;
	}

	.panel header button {
		background: none;
		border: none;
		cursor: pointer;
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
	.selectedItem:hover {
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
</style>
