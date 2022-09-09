<script>
	import * as _ from 'lamb';
	import {Switch} from '@svizzle/ui';

	import BarchartVDiv from '$lib/components/svizzle/BarchartVDiv.svelte';
	import Input from '$lib/components/svizzle/Input.svelte';
	import {_keyOrgTypeValueOrgsCount, _orgsCount} from '$lib/stores/data';
	import {
		_orgSearchValue,
		_orgTypesSelectionMode,
		_placesSearchValue,
		_selectedOrgTypes,
		orgTypesSelectionModes,
		toggleOrgType,
		toggleOrgTypesSelectionMode,
	} from '$lib/stores/selection';
	import {_currThemeVars, _orgTypeToColorFn} from '$lib/stores/theme';

	const toggledOrgType = ({detail: {id}}) => toggleOrgType(id);
</script>

<div class='Settings'>

	<!-- Search -->

	<div class='panel'>
		<h3>{$_orgsCount} organisations </h3>

		<div class='group'>
			<div class='item'>
				<Input
					bind:value={$_orgSearchValue}
					placeholder='search in name or description'
				/>
			</div>

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
		<h3>Org types</h3>

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
							$_currThemeVars['--colorOrgPlace'],
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

</div>

<style>
	.Settings {
		width: 100%;
		height: 100%;
		padding: 1em;
	}

	.panel:not(:last-child) {
		border-bottom: 1px solid lightgrey;
		margin-bottom: 1em;
		padding-bottom: 1em;
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
</style>
