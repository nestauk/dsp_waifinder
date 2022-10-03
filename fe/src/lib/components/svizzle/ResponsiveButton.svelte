<script>
	import {makeStyleVars} from '@svizzle/dom';
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
	export let theme;

	const defaultTheme = {
		colorBackground: 'initial',
		colorBackgroundActive: '#333',
		colorBorder: 'initial',
		colorText: 'initial',
		colorTextActive: 'white',
	};

	$: doesOverflow = $_contentSize.inlineSize < $_sensorSize.inlineSize;
	$: theme = {...defaultTheme, ...theme};
	$: style = makeStyleVars(theme);
</script>

<div
	{style}
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
		border: var(--border);
		border-bottom: none;
		cursor: pointer;
		height: 100%;
		padding: 0.5em;
		width: 100%;
	}
	.content {
		align-items: center;
		background: var(--colorBackground);
		color: var(--colorText);
		display: flex;
		justify-content: center;
	}
	.active {
		background: var(--colorActiveBackground);
		color: var(--colorActiveText);
	}

	.ResponsiveButtonSensor {
		position: absolute;
		visibility: hidden;
	}

	.nowrap {
		white-space: nowrap;
	}
</style>
