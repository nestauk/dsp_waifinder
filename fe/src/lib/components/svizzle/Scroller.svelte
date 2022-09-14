<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {setupResizeObserver} from '@svizzle/ui';

	let hasBottomShadow;
	let hasTopShadow;
	let scroller;
	let shadowOpacityBottom = 1;
	let shadowOpacityTop = 1;

	const {
		_writable: _size,
		resizeObserver
	} = setupResizeObserver();

	const onScroll = () => {
		const {
			offsetHeight,
			scrollTop,
			scrollHeight
		} = scroller;
		const scrollEnd = scrollTop + offsetHeight;
		const scrollBottom = scrollHeight - scrollEnd;

		hasTopShadow = scrollTop > 0;
		hasBottomShadow = scrollHeight > scrollEnd;
		shadowOpacityTop = scrollTop < 10 ? scrollTop / 10 : 1;
		shadowOpacityBottom = scrollBottom < 10
			? scrollBottom / 10
			: 1;
	};

	$: scroller && $_size && onScroll();
	$: bottomShadow = `inset 0px -12px 13px -13px rgba(211, 211, 211, ${shadowOpacityBottom})`;
	$: topShadow = `inset 0px 12px 13px -13px rgba(211, 211, 211, ${shadowOpacityTop})`;
	$: style = makeStyleVars({bottomShadow, topShadow});
</script>

<div
	{style}
	bind:this={scroller}
	class:shadowBottom={hasBottomShadow}
	class:shadowTop={hasTopShadow}
	class='Scroller'
	on:scroll={onScroll}
	use:resizeObserver
>
	<slot/>
</div>

<style>
	.Scroller {
		height: 100%;
		overflow: auto;
		position: relative;
		z-index: 1;
	}

	.shadowTop {
		box-shadow: var(--topShadow);
	}
	.shadowBottom {
		box-shadow: var(--bottomShadow);
	}
	.shadowTop.shadowBottom {
		box-shadow:
			var(--topShadow),
			var(--bottomShadow);
	}
</style>
