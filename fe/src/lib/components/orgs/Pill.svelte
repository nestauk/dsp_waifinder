<script>
	export let label = null;
</script>

<div class='Pill'>
	<span class='label'>{label}</span>
</div>

<style>
	.Pill {
		align-items: center;
		background-color: var(--colorPillBackground);
		border-radius: 50vh;
		color: var(--colorPill);
		display: flex;
		padding: 0.2em 0.4em;
	}

	.label {
		font-size: 0.9em;
		font-weight: bold;
		margin: 0 0.3em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.score {
		color: var(--colorPillScore);
		font-size: 0.75em;
		font-style: italic;
		margin: 0 0.3em;
	}
</style>
