<script>
	import {setupResizeObserver} from '@svizzle/ui';

	const {
		_writable: _contentSize,
		resizeObserver: contentSizeObserver
	} = setupResizeObserver();

	const {
		_writable: _sensorSize,
		resizeObserver: sensorSizeObserver
	} = setupResizeObserver();

	export let doesOverflow;
	export let isActive;
	export let isOptionalHidden;
	export let title='';

	$: doesOverflow = $_contentSize.inlineSize < $_sensorSize.inlineSize;
</script>

<div
	{title}
	class:active={isActive}
	class='ResponsiveButton nowrap'
	on:click
>
	<div
		class='content'
		use:contentSizeObserver
	>
		{#if !doesOverflow && !isOptionalHidden}
			<slot name='optional' />
		{/if}
		<slot name='always' />
	</div>
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
		height: 100%;
		width: 100%;
		border: 1px solid lightgrey; /* FIXME temp solution */
		cursor: pointer;
		padding: 0.5em;
	}
	.content {
		align-items: center;
		display: flex;
		justify-content: center;
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
