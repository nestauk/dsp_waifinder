<script>
	import {Icon, List, MapPin, Sliders, Tag} from '@svizzle/ui';
	import {noop} from '@svizzle/utils';

	import City from '$lib/components/explorer/icons/City.svelte';
	import Region from '$lib/components/explorer/icons/Region.svelte';
	import {_getIconColor} from '$lib/stores/theme';

	export let activeViewId;
	export let setView = noop;
</script>

<nav class='ViewSelector'>

	<!-- settings -->
	<div
		class:active={activeViewId === 'settings'}
		class='button clickable'
		on:click={setView('settings')}
	>
		<Icon
			glyph={Sliders}
			stroke={$_getIconColor('settings', activeViewId)}
		/>
	</div>

	<!-- map -->
	<div
		class:active={activeViewId === 'map'}
		class='button clickable'
		on:click={setView('map')}
	>
		<Icon
			glyph={MapPin}
			stroke={$_getIconColor('map', activeViewId)}
		/>
	</div>

	<!-- details -->
	<div
		class:active={activeViewId === 'details'}
		class='button clickable'
		on:click={setView('details')}
	>
		<Icon
			glyph={List}
			stroke={$_getIconColor('details', activeViewId)}
		/>
	</div>

	<!-- topics -->
	<div
		class:active={activeViewId === 'topics'}
		class='button clickable'
		on:click={setView('topics')}
	>
		<Icon
			glyph={Tag}
			stroke={$_getIconColor('topics', activeViewId)}
		/>
	</div>

	<!-- places -->
	<div
		class:active={activeViewId === 'places'}
		class='button clickable'
		on:click={setView('places')}
	>
		<Icon
			fill={$_getIconColor('places', activeViewId)}
			glyph={City}
			stroke='none'
		/>
	</div>

	<!-- regions -->
	<div
		class:active={activeViewId === 'regions'}
		class='button clickable'
		on:click={setView('regions')}
	>
		<Icon
			glyph={Region}
			stroke={$_getIconColor('regions', activeViewId)}
			strokeWidth=1.25
		/>
	</div>
</nav>

<style>
	.ViewSelector {
		background-color: var(--colorBackground);
		border-top: var(--border);
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: 100%;
		height: 100%;
		width: 100%;
	}
	.active {
		background: var(--colorSelectedBackground);
		color: var(--colorSelectedText);
	}

	.button {
		align-items: center;
		align-self: stretch;
		display: grid;
		justify-items: center;
		justify-self: stretch;
		padding: .5em 0;
	}
	/* .rotated {
		transform: scaleX(-1) rotate(-90deg);
	} */

	.clickable {
		cursor: pointer;
	}
</style>
