<script>
	import {Icon, List, Tag} from '@svizzle/ui';
	import {noop} from '@svizzle/utils';

	import {getStrokeColor} from '$lib/components/explorer/utils';
	import City from '$lib/components/icons/City.svelte';
	import Region from '$lib/components/icons/Region.svelte';
	import ResponsiveButton from '$lib/components/svizzle/ResponsiveButton.svelte';

	export let activeViewId;
	export let setView = noop;

	let detailsOverflows;
	let topicsOverflows;
	let placesOverflows;
	let regionsOverflows;

	$: isOptionalHidden =
		detailsOverflows
		|| topicsOverflows
		|| placesOverflows
		|| regionsOverflows;
</script>

<nav class='MultiviewSelector'>


	<!-- details -->
	<ResponsiveButton
		active={activeViewId === 'details'}
		on:click={setView('details')}
		bind:doesOverflow={detailsOverflows}
		{isOptionalHidden}
	>
		<span slot='optional'>Details</span>
		<Icon
			glyph={List}
			slot='always'
			stroke={getStrokeColor('details', activeViewId)}
		/>
	</ResponsiveButton>


	<!-- topics -->
	<ResponsiveButton
		active={activeViewId === 'topics'}
		on:click={setView('topics')}
		bind:doesOverflow={topicsOverflows}
		{isOptionalHidden}
	>
		<span slot='optional'>Topics</span>
		<Icon
			glyph={Tag}
			slot='always'
			stroke={getStrokeColor('topics', activeViewId)}
		/>
	</ResponsiveButton>

	<!-- places -->
	<ResponsiveButton
		active={activeViewId === 'places'}
		on:click={setView('places')}
		bind:doesOverflow={placesOverflows}
		{isOptionalHidden}
	>
		<span slot='optional'>Places</span>
		<Icon
			fill={getStrokeColor('places', activeViewId)}
			glyph={City}
			slot='always'
			stroke='none'
		/>
	</ResponsiveButton>

	<!-- regions -->
	<ResponsiveButton
		active={activeViewId === 'regions'}
		on:click={setView('regions')}
		bind:doesOverflow={regionsOverflows}
		{isOptionalHidden}
	>
		<span slot='optional'>Regions</span>
		<Icon
			glyph={Region}
			slot='always'
			stroke={getStrokeColor('regions', activeViewId)}
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

	/* .rotated {
		transform: scaleX(-1) rotate(-90deg);
	} */

	span {
		margin-right: 1em;
	}
</style>
