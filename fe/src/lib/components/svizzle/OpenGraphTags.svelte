<script>
	export let tags = [];
</script>

{#each tags as {key, value}}
	<meta
		content={value}
		property='og:{key}'
	/>
{/each}
