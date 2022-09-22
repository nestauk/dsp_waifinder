<script>
	import {_autoZoom} from '$lib/stores/data';
	import {_isZoomBannerVisible} from '$lib/stores/interaction';

	const onInteraction = e => {
		$_isZoomBannerVisible = true;
	}
</script>

<div
	class="Shield {$_autoZoom ? 'active' : ''}"
	on:mousedown|stopPropagation={onInteraction}
	on:click|stopPropagation={onInteraction}
	on:wheel|stopPropagation={onInteraction}
>
</div>

<style>
	.Shield {
		display: none;
	}

	.Shield.active {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;

		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: all;
	}
</style>
