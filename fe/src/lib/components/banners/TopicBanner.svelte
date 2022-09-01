<script>
	import Icon from '@svizzle/ui/src/icons/Icon.svelte';
	import Link from '@svizzle/ui/src/Link.svelte';
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';

	import Banner from '$lib/components/svizzle/Banner.svelte';
	import LayoutHMF from '$lib/components/svizzle/LayoutHMF.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import WikipediaLogo from '$lib/components/icons/WikipediaLogo.svelte';
	import {bannersDefaultFooterText} from '$lib/config';
	import {
		_activeTopicDetails,
		clearActiveTopic
	} from '$lib/stores/topics';
	import {getFirstPhrases} from '$lib/utils/dataUtils';
	import {getWikipediaURL} from '$lib/utils/dbpedia';

	export let hasBackground = false;
	export let isPinned;

	let isImgErrored = false;

	const notifyImgError = () => {
		isImgErrored = true;
	}

	$: title = $_activeTopicDetails?.label ?? '';
	$: abstract = $_activeTopicDetails?.abstract
		? getFirstPhrases($_activeTopicDetails.abstract, 300)
		: 'No info';
	$: thumbnailURL = $_activeTopicDetails?.thumbnailURL;
	$: footerText = isPinned
		? bannersDefaultFooterText
		: `Click to open this topic's Wikipedia page`;
	$: wikipediaURL = getWikipediaURL($_activeTopicDetails.id);
</script>

<Banner
	{_screen}
	{hasBackground}
	isNarrow={isPinned}
	on:close={clearActiveTopic}
>
	<LayoutHMF>
		<h2 slot='header'>{title}</h2>
		<div class='topic' slot='main'>
			{#if $_activeTopicDetails?.isLoading}
				<LoadingView />
			{:else}
				<Scroller>
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
				</Scroller>
			{/if}
		</div>
		<div
			class='footer {$_screen?.classes}'
			slot='footer'
		>
			{#if isPinned}
				<Link
					href={wikipediaURL}
					isBold={true}
					target='_blank'
				>
					<Icon
						fill='black'
						glyph={WikipediaLogo}
						size=24
						stroke='none'
					/>
				</Link>
			{/if}
			<p>{footerText}</p>
		</div>
	</LayoutHMF>
</Banner>

<style>
	.topic {
		height: 100%;
		padding: 1em;
		padding-top: 0;
	}

	p {
		hyphens: auto;
	}
	img {
		float: right;
		margin: 0.5em;
		max-height: 10em;
		max-width: 50%;
	}
	.footer {
		display: grid;
		grid-template-columns: min-content 1fr;
	}
	.medium.footer {
		grid-template-columns: 1fr;
	}
</style>
