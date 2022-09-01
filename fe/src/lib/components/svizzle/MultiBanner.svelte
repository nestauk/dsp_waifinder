<script>
	import LayoutHMF from '$lib/components/svizzle/LayoutHMF.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';

	import Banner from './Banner.svelte';

	export let _screen;
	export let components;
	export let currentIndex;
	export let footerText = 'Click on background to dismiss';
	export let theme;

	let isActive = false;

	function init () {
		currentIndex = 0;
		isActive = true;
	}

	function next () {
		currentIndex++;
		if (currentIndex >= components.length) {
			isActive = false;
		}
	}

	$: components?.length > 0 && init();
</script>

{#if isActive}
	<Banner
		{_screen}
		{theme}
		on:close={next}
	>
		<LayoutHMF>
			<div slot='main'>
				<Scroller>
					<svelte:component this={components?.[currentIndex]} />
				</Scroller>
			</div>
			<p slot='footer'>{footerText}</p>
		</LayoutHMF>
	</Banner>
{/if}

<style>
	div {
		height: 100%;
		padding: 1.0em;
		position: relative;
	}
</style>
