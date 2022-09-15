<script context='module'>
	// create alphabet array
	const alphabetArray = Object.freeze(
		'0ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
	);
</script>

<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {createEventDispatcher} from 'svelte';

	export let labels;
	export let enabled;
	export let theme;

	const dispatch = createEventDispatcher();

	const defaultTheme = {
		backgroundColor: 'darkblue',
		backgroundColorDisabled: 'darkblue',
		textColor: 'white',
		textColorDisabled: 'silver'
	};

	$: labels = labels || alphabetArray;
	$: enabled = enabled || [];
	$: theme = {
		...defaultTheme,
		...theme
	}
	$: style = makeStyleVars(theme);
</script>

<nav {style}>
	{#each labels as label}
		<input
			on:click={() => dispatch('letterSelected', label)}
			type='button'
			value={label}
			disabled={!enabled.includes(label)}
		/>
	{/each}
</nav>

<style>
	nav {
		display: grid;
	}
	input {
		background-color: var(--backgroundColor);
		border: none;
		color: var(--textColor);
		cursor: pointer;
		text-align: center;
		padding: 0 0.5em;
	}
	input:disabled {
		background-color: var(--backgroundColorDisabled);
		color: var(--textDisabledColor);
		cursor: inherit;
	}
</style>
