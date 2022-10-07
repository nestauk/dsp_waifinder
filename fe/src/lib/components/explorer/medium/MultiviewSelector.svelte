<script>
	import {Icon, List, Tag} from '@svizzle/ui';
	import {noop} from '@svizzle/utils';

	import City from '$lib/components/icons/City.svelte';
	import Region from '$lib/components/icons/Region.svelte';
	import ResponsiveButton from '$lib/components/svizzle/ResponsiveButton.svelte';
	import {_currThemeVars, _getIconColor} from '$lib/stores/theme';

	export let activeViewId;
	export let setView = noop;

	let detailsOverflows;
	let topicsOverflows;
	let placesOverflows;
	let regionsOverflows;

	$: theme = {
		borderRight: $_currThemeVars['--border'],
		borderTop: $_currThemeVars['--border'],
		colorBackgroundActive: $_currThemeVars['--colorSelectedBackground'],
		colorTextActive: $_currThemeVars['--colorSelectedText'],
	}
	$: isOptionalHidden =
		detailsOverflows
		|| topicsOverflows
		|| placesOverflows
		|| regionsOverflows;
</script>

<nav class='MultiviewSelector'>

	<!-- details -->

	<ResponsiveButton
		{isOptionalHidden}
		{theme}
		bind:doesOverflow={detailsOverflows}
		isActive={activeViewId === 'details'}
		on:click={setView('details')}
		title='List of organisations'
	>
		<span slot='optional'>Details</span>
		<Icon
			glyph={List}
			slot='always'
			stroke={$_getIconColor('details', activeViewId)}
		/>
	</ResponsiveButton>

	<!-- topics -->

	<ResponsiveButton
		{isOptionalHidden}
		{theme}
		bind:doesOverflow={topicsOverflows}
		isActive={activeViewId === 'topics'}
		on:click={setView('topics')}
		title='Amount of organisations by topic'
	>
		<span slot='optional'>Topics</span>
		<Icon
			glyph={Tag}
			slot='always'
			stroke={$_getIconColor('topics', activeViewId)}
		/>
	</ResponsiveButton>

	<!-- places -->

	<ResponsiveButton
		{isOptionalHidden}
		{theme}
		bind:doesOverflow={placesOverflows}
		isActive={activeViewId === 'places'}
		on:click={setView('places')}
		title='Amount of organisations by place'
	>
		<span slot='optional'>Places</span>
		<Icon
			fill={$_getIconColor('places', activeViewId)}
			glyph={City}
			slot='always'
			stroke='none'
		/>
	</ResponsiveButton>

	<!-- regions -->

	<ResponsiveButton
		{isOptionalHidden}
		bind:doesOverflow={regionsOverflows}
		isActive={activeViewId === 'regions'}
		on:click={setView('regions')}
		theme={{
			...theme,
			borderRight: 'none'
		}}
		title='Amount of organisations by region (NUTS3)'
	>
		<span slot='optional'>Regions</span>
		<Icon
			glyph={Region}
			slot='always'
			stroke={$_getIconColor('regions', activeViewId)}
			strokeWidth=1.25
		/>
	</ResponsiveButton>
</nav>

<style>
	.MultiviewSelector {
		background-color: var(--colorBackground);
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 100%;
		height: 100%;
		width: 100%;
	}

	span {
		margin-right: 1em;
	}
</style>
