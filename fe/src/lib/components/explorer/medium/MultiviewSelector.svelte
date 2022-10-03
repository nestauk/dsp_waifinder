<script>
	import {Icon, List, Tag} from '@svizzle/ui';
	import {noop} from '@svizzle/utils';

	import City from '$lib/components/icons/City.svelte';
	import Region from '$lib/components/icons/Region.svelte';
	import ResponsiveButton from '$lib/components/svizzle/ResponsiveButton.svelte';
	import {_currThemeVars, _getStrokeColor} from '$lib/stores/theme';

	export let activeViewId;
	export let setView = noop;

	let detailsOverflows;
	let topicsOverflows;
	let placesOverflows;
	let regionsOverflows;

	const theme = {
		activeColorBackground: $_currThemeVars['--colorSelected'],
		activeColorText:  $_currThemeVars['--colorSelectedText'],
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
		bind:doesOverflow={detailsOverflows}
		isActive={activeViewId === 'details'}
		on:click={setView('details')}
		{theme}
		title='List of organisations'
	>
		<span slot='optional'>Details</span>
		<Icon
			glyph={List}
			slot='always'
			stroke={$_getStrokeColor('details', activeViewId)}
		/>
	</ResponsiveButton>

	<!-- topics -->

	<ResponsiveButton
		{isOptionalHidden}
		bind:doesOverflow={topicsOverflows}
		isActive={activeViewId === 'topics'}
		on:click={setView('topics')}
		{theme}
		title='Amount of organisations by topic'
	>
		<span slot='optional'>Topics</span>
		<Icon
			glyph={Tag}
			slot='always'
			stroke={$_getStrokeColor('topics', activeViewId)}
		/>
	</ResponsiveButton>

	<!-- places -->

	<ResponsiveButton
		{isOptionalHidden}
		bind:doesOverflow={placesOverflows}
		isActive={activeViewId === 'places'}
		on:click={setView('places')}
		{theme}
		title='Amount of organisations by place'
	>
		<span slot='optional'>Places</span>
		<Icon
			fill={$_getStrokeColor('places', activeViewId)}
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
		{theme}
		title='Amount of organisations by region (NUTS3)'
	>
		<span slot='optional'>Regions</span>
		<Icon
			glyph={Region}
			slot='always'
			stroke={$_getStrokeColor('regions', activeViewId)}
			strokeWidth=1.25
		/>
	</ResponsiveButton>
</nav>

<style>
	.MultiviewSelector {
		background-color: var(--colorBackgroundMain);
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
