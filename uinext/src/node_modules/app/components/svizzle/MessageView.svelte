<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let backgroundColor = null;
	export let color = null;
	export let fontSize = null;
	export let padding = null;
	export let text = null;
	export let textAlign = null;

	// FIXME https://github.com/sveltejs/svelte/issues/4442
	$: text = text ?? 'Please provide a message';

	$: style = makeStyleVars({
		backgroundColor: backgroundColor || 'white',
		color: color || 'black',
		fontSize: fontSize || '14px',
		padding: padding || '0',
		textAlign: textAlign || 'start'
	});
</script>

<div class='MessageView' {style}>
	<span>{text}</span>
</div>

<style>
	.MessageView {
		align-items: center;
		background-color: var(--backgroundColor);
		color: var(--color);
		display: flex;
		font-size: var(--fontSize);
		height: 100%;
		justify-content: center;
		padding: var(--padding);
		text-align: var(--textAlign);
		width: 100%;
	}
</style>
