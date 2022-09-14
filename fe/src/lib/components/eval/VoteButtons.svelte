<script>
	import {Icon, SkipForward, ThumbsDown, ThumbsUp} from '@svizzle/ui';
	import {noop} from '@svizzle/utils';
	import {createEventDispatcher} from 'svelte';

	import {_isSmallScreen} from '$lib/stores/layout';

	export let isVerticalLayout = false;

	const dispatch = createEventDispatcher();

	const voted = vote => {
		dispatch('voted', vote);
	};

	const keyboardVote = ({key}) => {
		if (key === 'y') {
			voted('keep')
		} else if (key === 'n') {
			voted('dismiss')
		} else if (key === 's') {
			voted('skip')
		}
	}

	$: handleKeydown = $_isSmallScreen ? noop : keyboardVote;
	$: labels = $_isSmallScreen
		? {yes: 'Yes', no: 'No', skip: 'Skip'}
		: {yes: 'Yes [y]', no: 'No [n]', skip: 'Skip [s]'}
</script>

<svelte:window on:keydown={handleKeydown}/>

<div
	class:vertical={isVerticalLayout}
	class='controls'
>
	<button
		class='keep'
		on:click={() => voted('keep')}
	>
		<Icon
			glyph={ThumbsUp}
			size=30
			stroke='green'
			strokeWidth=2
		/>
		<p>{labels.yes}</p>
	</button>
	<button
		class='dismiss'
		on:click={() => voted('dismiss')}
	>
		<Icon
			glyph={ThumbsDown}
			size=30
			stroke='red'
			strokeWidth=2
		/>
		<p>{labels.no}</p>
	</button>
	<button
		class='skip'
		on:click={() => voted('skip')}
	>
		<Icon
			glyph={SkipForward}
			size=30
			stroke='orange'
			strokeWidth=2
		/>
		<p>{labels.skip}</p>
	</button>
</div>

<style>
	.controls {
		align-content: center;
		display: grid;
		grid-auto-flow: column;
		justify-content: center;
		column-gap: 0.5em;
	}

	.controls.vertical {
		grid-auto-flow: row;
		row-gap: 0.5em;
	}

	.controls button {
		align-items: center;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		font-size: 1em;
		gap: 0.5rem;
		height: 6em;
		justify-content: center;
		padding: 0.5em;
		width: 6em;
	}

	.keep {
		background: rgb(219, 255, 164);
		border: 2px solid green;
	}
	.dismiss {
		background: rgb(255, 168, 168);
		border: 2px solid red;
	}
	.skip {
		background: lightgoldenrodyellow;
		border: 2px solid orange;
	}
</style>
