<script>
	export let label = null;
	export let nowrap;

	$: nowrap = nowrap ?? true;
</script>

<div class='Pill'>
	<span
		class:nowrap
		class='label'
	>{label}</span>
</div>

<style>
	.Pill {
		align-items: center;
		background-color: var(--colorPillBackground);
		border-radius: 50vh;
		color: var(--colorPill);
		display: flex;
		padding: 0.2em 0.4em;
		text-align: center;
	}

	.label {
		font-size: 0.9em;
		font-weight: bold;
		margin: 0 0.3em;
		overflow: hidden;
	}
	.nowrap {
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
