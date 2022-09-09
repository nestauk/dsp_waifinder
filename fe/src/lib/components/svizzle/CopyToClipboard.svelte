<script>
	import {Clipboard, Copy, Icon} from '@svizzle/ui';

	export let getText = () => '';

	let isTextCopyRecentlyFailed = false;
	let isTextRecentlyCopied = false;

	const copy = () => {
		const text = getText();
		if (text && navigator.clipboard) {
			// FIXME Only uses clipboard if available, but always notifies success
			navigator.clipboard?.writeText(text);
			isTextRecentlyCopied = true;
			setTimeout(() => {
				isTextRecentlyCopied = false
			}, 2000);
		} else {
			isTextCopyRecentlyFailed = true;
			setTimeout(() => {
				isTextCopyRecentlyFailed = false
			}, 2000);
		}
	};
</script>

<div on:click={copy}>
	{#if isTextRecentlyCopied}
		<Icon
			glyph={Clipboard}
			stroke='green'
		/>
	{:else if isTextCopyRecentlyFailed}
		<Icon
			glyph={Clipboard}
			stroke='red'
		/>
	{:else}
		<Icon glyph={Copy} />
	{/if}
</div>
