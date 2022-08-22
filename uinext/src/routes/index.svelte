<script>
	import {toolName} from 'app/config';

	import Content from './_content/Index.svx';
</script>

<svelte:head>
	<title>About - {toolName}</title>
	<meta
		content='{toolName}: homepage'
		name='description'
	>
</svelte:head>

<main class='about'>
	<div>
		<Content />
	</div>
</main>

<style>
	.about {
		background-color: var(--colorBackground);
		display: flex;
		font-weight: 200;
		height: 100%;
		justify-content: space-around;
		width: 100%;
	}

	div {
		background-color: var(--colorBackgroundMain);
		max-width: 900px;
		overflow-y: auto;
		padding: 2rem;
	}
</style>
