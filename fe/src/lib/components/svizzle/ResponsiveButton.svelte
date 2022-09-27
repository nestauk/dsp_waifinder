<script>
	import {setupResizeObserver} from '@svizzle/ui';

	const {
		_writable: _buttonSize,
		resizeObserver: buttonSizeObserver
	} = setupResizeObserver();

	const {
		_writable: _expandedSize,
		resizeObserver: expandedSizeObserver
	} = setupResizeObserver();

	export let active;
	export let doesOverflow;
	export let isOptionalHidden;

	$: doesOverflow = $_buttonSize.inlineSize < $_expandedSize.inlineSize
</script>

<div
	class='button'
	class:active
	on:click
	use:buttonSizeObserver
>
	{#if !doesOverflow && !isOptionalHidden}
		<slot name='optional' />
	{/if}
	<slot name='always' />
</div>

<div
	class='ghost'
	on:click
	use:expandedSizeObserver
	role='none'
>
	<slot name='optional' />
	<slot name='always' />
</div>

<style>
	div {
		white-space: nowrap;
	}

	.button {
		align-items: center;
		border: 1px solid lightgrey; /* FIXME temp solution */
		cursor: pointer;
		display: flex;
		height: 100%;
		justify-content: center;
		padding: 0.5em 0;
		width: 100%;
	}

	.active {
		background: var(--colorSelected);
		color: var(--colorSelectedText);
	}

	.ghost {
		position: absolute;
		visibility: hidden;
	}
</style>
