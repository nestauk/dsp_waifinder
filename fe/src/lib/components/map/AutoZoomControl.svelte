<script>
	import {_autoZoom} from '$lib/stores/interaction';

	export let map;
</script>

<div class='AutoZoomControl'>
	<input
		id='autozoom'
		type='checkbox'
		bind:checked={$_autoZoom}
	/>
	<label for='autozoom'>Auto-zoom</label>
</div>

<style>
	div {
		align-items: center;
		background: white;
		border-radius: 4px;
		color: black;
		column-gap: 0.5em;
		display: grid;
		grid-auto-flow: column;
		padding: 0.25em 0.5em;
		user-select: none;
	}
	div * {
		cursor: pointer;
	}

	div:has(:focus-visible) {
		outline: var(--outline);
		outline-offset: calc(-1 * var(--outlineWidth));
	}
	input:focus-visible {
		outline: none;
	}
</style>
