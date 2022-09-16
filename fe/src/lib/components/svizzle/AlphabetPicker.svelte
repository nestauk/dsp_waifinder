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
	$: theme = {...defaultTheme, ...theme};
	$: style = makeStyleVars(theme);
</script>

<nav
	{style}
	class='AlphabetPicker'
>
	{#each labels as label}
		<input
			disabled={!enabled.includes(label)}
			on:click={() => dispatch('letterSelected', label)}
			type='button'
			value={label}
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
		padding: 0 0.5em;
		text-align: center;
	}
	input:disabled {
		background-color: var(--backgroundColorDisabled);
		color: var(--textDisabledColor);
		cursor: inherit;
	}
</style>
