<script>
	import {_screen, Icon, List, setupResizeObserver,Tag} from '@svizzle/ui';
	import {noop} from '@svizzle/utils';

	import {getStrokeColor} from '$lib/components/explorer/utils';
	import City from '$lib/components/icons/City.svelte';
	import Region from '$lib/components/icons/Region.svelte';

	export let activeViewId;
	export let setView = noop;

	const {
		_writable: _size,
		resizeObserver
	} = setupResizeObserver('multiviewselector');

	$: console.log($_size)
	$: console.log($_screen)
	$: charsAvailable = $_size.inlineSize / ($_screen?.glyph.width || 9);
	$: console.log('chars', charsAvailable);
</script>

<nav class='MultiviewSelector' use:resizeObserver>

	<!-- details -->
	<div
		class:active={activeViewId === 'details'}
		class='button'
		on:click={setView('details')}
	>
		{#if charsAvailable > 43}
			<span>Details</span>
		{/if}
		<Icon
			glyph={List}
			stroke={getStrokeColor('details', activeViewId)}
		/>
	</div>

	<!-- topics -->
	<div
		class:active={activeViewId === 'topics'}
		class='button'
		on:click={setView('topics')}
	>
		{#if charsAvailable > 43}
			<span>Topics</span>
		{/if}
		<span>
			<Icon
				glyph={Tag}
				stroke={getStrokeColor('topics', activeViewId)}
			/>
		</span>
	</div>

	<!-- places -->
	<div
		class:active={activeViewId === 'places'}
		class='button'
		on:click={setView('places')}
	>
		{#if charsAvailable > 43}
			<span>Places</span>
		{/if}
		<span>
			<Icon
				fill={getStrokeColor('places', activeViewId)}
				glyph={City}
				stroke='none'
			/>
		</span>
	</div>

	<!-- regions -->
	<div
		class:active={activeViewId === 'regions'}
		class='button'
		on:click={setView('regions')}
	>
		{#if charsAvailable > 43}
			<span>Regions</span>
		{/if}
		<span>
			<Icon
				glyph={Region}
				stroke={getStrokeColor('regions', activeViewId)}
				strokeWidth=1.25
			/>
		</span>
	</div>
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
	.active {
		background: var(--colorSelected);
		color: var(--colorSelectedText);
	}

	.button {
		align-items: center;
		border: 1px solid lightgrey; /* FIXME temp solution */
		cursor: pointer;
		display: flex;
		height: 100%;
		justify-content: center;
		padding: 0.5em 0;
		width: 100%;
	}
	/* .rotated {
		transform: scaleX(-1) rotate(-90deg);
	} */

	span {
		margin-right: 1em;
	}
</style>
