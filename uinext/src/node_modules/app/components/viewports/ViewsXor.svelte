<script>
	import {noop} from '@svizzle/utils';
	import {setContext} from 'svelte';
	import {writable} from 'svelte/store';

	export let viewId;

	const _viewId = writable();

	const registerView = noop;

	setContext('viewport', {
		_viewId,
		registerView,
		viewType: 'xor'
	});

	$: $_viewId = viewId;
</script>

<div class='ViewsXor'>
	<slot />
</div>

<style>
	.ViewsXor {
		width: 100%;
		height: 100%;
	}
</style>
