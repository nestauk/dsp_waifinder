<script>
	import {_screen} from '@svizzle/ui';
	import {createEventDispatcher} from 'svelte';

	import Banner from '$lib/components/svizzle/Banner.svelte';
	import LayoutHMF from '$lib/components/svizzle/LayoutHMF.svelte';
	import {_autoZoom} from '$lib/stores/data';

	const dispatch = createEventDispatcher();

	const close = () => dispatch('close');

	const disengageAutoZoom = () => {
		$_autoZoom = false;
		close();
	}
</script>

<Banner
	{_screen}
	on:close
>
	<LayoutHMF>
		<p slot='main'>
			auto-zoom is ON: do you want to disengage it?
		</p>
		<div slot='footer'>
			<button on:click={disengageAutoZoom}>Yes</button>
			<button on:click={close}>No</button>
		</div>
	</LayoutHMF>
</Banner>
