<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {Clipboard, Copy, Icon} from '@svizzle/ui';

	export let getText = () => '';
	export let theme;

	const defaultTheme = {
		color: 'inherit',
		background: 'inherit',
		focusOutline: '1px solid'
	}

	let isTextCopyRecentlyFailed = false;
	let isTextRecentlyCopied = false;

	const copy = () => {
		const text = getText();
		if (text && navigator.clipboard) {
			// FIXME Only uses clipboard if available, but always notifies success
			navigator.clipboard?.writeText(text);
			isTextRecentlyCopied = true;
			setTimeout(() => {
				isTextRecentlyCopied = false
			}, 2000);
		} else {
			isTextCopyRecentlyFailed = true;
			setTimeout(() => {
				isTextCopyRecentlyFailed = false
			}, 2000);
		}
	};

	$: style = makeStyleVars({...defaultTheme, ...theme});
</script>

<button
	on:click={copy}
	{style}
>
	{#if isTextRecentlyCopied}
		<Icon
			glyph={Clipboard}
			stroke='green'
		/>
	{:else if isTextCopyRecentlyFailed}
		<Icon
			glyph={Clipboard}
			stroke='red'
		/>
	{:else}
		<Icon glyph={Copy} />
	{/if}
</button>

<style>
	button {
		border: none;
		display: block;
		color: var(--color);
		background: var(--background);
	}
	button:focus {
		outline: var(--focusOutline);
		outline-offset: calc( -1 * var(--focusLineWidth));
	}
</style>
