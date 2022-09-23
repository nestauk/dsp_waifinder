<script>
	import {_autoZoom} from '$lib/stores/interaction';

	export let map;
</script>

<div class='AutoZoomControl'>
	<input id='autozoom' type='checkbox' bind:checked={$_autoZoom} />
	<label for='autozoom'>auto-zoom</label>
</div>

<style>
	div {
		background: white;
		border-radius: 4px;
		padding: 0.25em 0.5em;
		display: grid;
		align-items: center;
		grid-auto-flow: column;
		column-gap: 0.25em;
	}
</style>
