<script>
	import {setupResizeObserver} from '@svizzle/ui';

	const {
		_writable: _buttonSize,
		resizeObserver: buttonSizeObserver
	} = setupResizeObserver();

	const {
		_writable: _expandedSize,
		resizeObserver: sensorSizeObserver
	} = setupResizeObserver();

	export let doesOverflow;
	export let isActive;
	export let isOptionalHidden;

	$: doesOverflow = $_buttonSize.inlineSize < $_expandedSize.inlineSize
</script>

<div
	class:active={isActive}
	class='ResponsiveButton nowrap'
	on:click
	use:buttonSizeObserver
>
	{#if !doesOverflow && !isOptionalHidden}
		<slot name='optional' />
	{/if}
	<slot name='always' />
</div>

<div
	class='ResponsiveButtonSensor nowrap'
	role='none'
	use:sensorSizeObserver
>
	<slot name='optional' />
	<slot name='always' />
</div>

<style>
	.ResponsiveButton {
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

	.ResponsiveButtonSensor {
		position: absolute;
		visibility: hidden;
	}

	.nowrap {
		white-space: nowrap;
	}
</style>
