<script>
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';

	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {getFirstPhrases} from '$lib/utils/dataUtils';

	export let topicDetails;

	let isImgErrored;

	const notifyImgError = () => {
		isImgErrored = true;
	}

	$: abstract = topicDetails?.abstract
		? getFirstPhrases(topicDetails.abstract, 300)
		: 'No info';
	$: thumbnailURL = topicDetails?.thumbnailURL;
</script>

<Scroller>
	{#if topicDetails}
		{#if topicDetails.isLoading}
			<LoadingView />
		{:else}
			{#if thumbnailURL && !isImgErrored}
				<img
					alt='Topic thumbnail.'
					on:error={notifyImgError}
					src={thumbnailURL}
				/>
			{/if}
			<p>
				{abstract}
			</p>
		{/if}
	{/if}
</Scroller>

<style>
	img {
		float: right;
		margin: 0.5em;
		max-height: 10em;
		max-width: 50%;
	}
</style>
