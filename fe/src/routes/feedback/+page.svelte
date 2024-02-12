<script>
	import {HyperLink} from '@svizzle/ui';

	import {contactEmail, toolName} from '$lib/config.js';
	import {_linkTheme1} from '$lib/stores/theme.js';
</script>

<svelte:head>
	<title>Feedback - {toolName}</title>
	<meta
		content='{toolName}: feedback'
		name='description'
	>
</svelte:head>

<p>We welcome and encourage feedback on the tool to ensure it remains relevant and useful.</p>
<p>
	If you would like your organisation to be included, updated or removed from the UK WAIfinder tool, or if you would like to send any feedback on the usability and functionality of the tool please contact
	<HyperLink
		href='mailto:{contactEmail}'
		theme={{
			...$_linkTheme1,
		}}
	>
		{contactEmail}
	</HyperLink>.
</p>

<style>
	p:not(:last-child) {
		margin-bottom: 1em;
	}
</style>
