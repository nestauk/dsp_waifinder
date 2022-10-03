<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {createEventDispatcher} from 'svelte';

	const defaultTheme = {
		border: 'thin solid rgb(70, 70, 70)',
		colorBackdropSensor: 'rgba(0, 0, 0, 0.25)',
		colorBackground: 'white',
		colorBoxShadow: 'lightgrey',
		colorText: 'black',
	};

	export let _screen;
	export let hasBackdrop = true;
	export let isNarrow = true;
	export let theme = defaultTheme;

	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: style = makeStyleVars(theme);
</script>

<div
	{style}
	aria-label="Banner"
	class:backdrop={hasBackdrop}
	class='Banner clickable {$_screen?.classes}'
	on:click={close}
	role='alert'
>
	<div
		class:narrow={isNarrow}
		class='inner'
		on:click|stopPropagation
	>
		<slot />
	</div>
</div>

<style>
	.Banner {
		box-shadow: 2px 8px 9px -4px var(--colorBoxShadow);
		height: 100%;
		left: 0;
		position: absolute;
		top: 0;
		user-select: none;
		width: 100%;
		z-index: 2000;
	}
	.Banner.backdrop {
		background-color: var(--colorBackdropSensor);
	}
	.inner {
		background: var(--colorBackground);
		border: var(--border);
		border-radius: 1rem;
		box-shadow: 2px 8px 9px -4px var(--colorBoxShadow);
		color: var(--colorText);
		cursor: initial;
		display: grid;
		grid-template-rows: 1fr;
		left: 50%;
		max-height: 90%;
		padding: 0.5rem;
		position: absolute;
		overflow: auto;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
	}
	.medium .inner {
		min-width: 50%;
	}

	.medium .narrow {
		width: min-content;
	}
</style>
