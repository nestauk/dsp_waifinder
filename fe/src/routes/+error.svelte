<script>
	import { page } from '$app/stores';
	import {toolName} from '$lib/config';
	import {isDev} from '$lib/env';


	$: status = $page.status;
	$: error = $page.error;
</script>

<svelte:head>
	<title>{toolName}: {status}</title>
	<meta
		content='Something went wrong, sorry!'
		name='description'
	>
</svelte:head>

<h1>{status}</h1>

<p>{error?.message || 'Message not defined'}</p>

{#if isDev && error?.stack}
	<pre>{error?.stack}</pre>
{/if}

<style>
	h1, p {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>
