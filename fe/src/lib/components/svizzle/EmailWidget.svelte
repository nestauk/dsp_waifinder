<script>
	import {Input} from '@svizzle/ui';
	// FIXME Consider RFC 5322 compliant email validation
	import emailRegex from 'email-regex';
	import {createEventDispatcher} from 'svelte';

	export let buttonText = 'Submit';
	export let hasButton = true;
	export let theme;

	const defaultTheme = {
		borderColor: 'rgb(70, 70, 70)',
		invalidEmailColor: 'red'
	};

	let email = '';
	let isValidEmail;

	const dispatch = createEventDispatcher();

	const onSubmitEmail = () => {
		if (isValidEmail) {
			dispatch('emailSubmitted', email);
		}
	};

	const regex = emailRegex({exact: true});

	$: isValidEmail = regex.test(email);
	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: inputTheme = {
		borderColor: isValidEmail
			? theme.borderColor
			: theme.invalidEmailColor
	};
</script>

<div class='EmailWidget'>
	<div class='controls'>
		<Input
			autofocus=true
			bind:value={email}
			on:submitted={onSubmitEmail}
			placeholder='Please insert your email'
			theme={inputTheme}
			type='email'
		/>
		{#if hasButton}
			<button
				disabled={!isValidEmail}
				on:click={onSubmitEmail}
			>
				{buttonText}
			</button>
		{/if}
	</div>
</div>

<style>
	.EmailWidget {
		align-items: center;
		display: grid;
		grid-template-columns: 1fr;
		height: 100%;
		justify-items: center;
		padding: 1em;
		width: 100%;
	}
	.controls {
		column-gap: 0.5em;
		display: grid;
		grid-template-columns: 1fr min-content;
		max-width: 20em;
		width: 100%;
	}
	button {
		border-radius: 0.125em;
		font-size: 1em;
		padding: 0.25em;
	}
</style>
