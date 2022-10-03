<script>
	import {_screen} from '@svizzle/ui';

	import AlphabetPicker from '$lib/components/svizzle/AlphabetPicker.svelte';
	import VirtualList from '$lib/components/VirtualList/VirtualList.svelte';
	import {_orgsChar} from '$lib/stores/data';
	import {_currThemeVars} from '$lib/stores/theme';

	import OrgDetails from './OrgDetails.svelte';

	export let items = [];

	let virtualList;

	const refreshList = () => virtualList?.refreshAction();

	const onCharSelected = ({detail: char}) => {
		const itemIndex = items.findIndex(item => char <= item.name[0]);
		virtualList.scrollTo(itemIndex);
	}

	$: $_screen && refreshList();
</script>

<div class='OrgsList'>
	<VirtualList
		{items}
		bind:this={virtualList}
		let:item
	>
		<OrgDetails
			{item}
			on:foldingToggled={refreshList}
		/>
	</VirtualList>
	<AlphabetPicker
		enabledChars={$_orgsChar}
		on:charSelected={onCharSelected}
		theme={{
			backgroundColor: $_currThemeVars['--colorAux'],
			backgroundColorDisabled: $_currThemeVars['--colorAux'],
			textColor: $_currThemeVars['--colorText'],
			textColorDisabled: $_currThemeVars['--colorTextDisabled']
		}}
	/>
</div>

<style>
	.OrgsList {
		display: grid;
		grid-template-areas: 'list picker';
		grid-template-columns: 1fr min-content;
		grid-template-rows: 1fr;
		height: 100%;
		overflow: auto;
	}
</style>
