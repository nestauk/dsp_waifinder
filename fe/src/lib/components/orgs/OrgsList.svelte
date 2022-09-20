<script>
	import {_screen} from '@svizzle/ui';

	import AlphabetPicker from '$lib/components/svizzle/AlphabetPicker.svelte';
	import VirtualList from '$lib/components/VirtualList/VirtualList.svelte';

	import OrgDetails from './OrgDetails.svelte';

	import {_orgsLetters} from '$lib/stores/data';
	import {_currThemeVars} from '$lib/stores/theme';

	export let items = [];

	let virtualList;

	const refreshList = () => virtualList?.refreshAction();

	const onCharSelected = ({detail: char}) => {
		const itemIndex = items.findIndex(item => char <= item.name[0]);
		virtualList.scrollTo(itemIndex)
		console.log(char)
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
		enabled={$_orgsLetters}
		on:charSelected={onCharSelected}
		theme={{
			backgroundColor: $_currThemeVars['--colorLink'],
			backgroundColorDisabled: $_currThemeVars['--colorLink'],
			textColor: $_currThemeVars['--colorMainInverted'],
			textColorDisabled: $_currThemeVars['--colorDisabled']
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
