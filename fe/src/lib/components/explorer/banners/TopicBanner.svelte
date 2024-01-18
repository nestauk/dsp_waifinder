<script>
	import {
		_screen,
		Banner,
		HyperLink,
		Icon,
		LayoutHMF,
		LoadingView,
		Scroller,
	} from '@svizzle/ui';

	import WikipediaLogo from '$lib/components/explorer/icons/WikipediaLogo.svelte';
	import {bannersDefaultFooterText} from '$lib/config.js';
	import {_bannersTheme, _linkTheme0} from '$lib/stores/theme.js';
	import {
		_activeTopicDetails,
		clearActiveTopic
	} from '$lib/stores/topics.js';
	import {getFirstPhrases} from '$lib/utils/dataUtils.js';
	import {getWikipediaURL} from '$lib/utils/dbpedia.js';

	export let hasBackdrop = false;
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
		: 'Click to open this topic\'s Wikipedia page';
	$: wikipediaURL = getWikipediaURL($_activeTopicDetails.id);
</script>

<Banner
	{_screen}
	{hasBackdrop}
	isNarrow={isPinned}
	on:close={clearActiveTopic}
	theme={$_bannersTheme}
>
	<LayoutHMF>
		<h2 slot='header'>{title}</h2>
		<div
			class='topic'
			slot='main'
		>
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
				<HyperLink
					href={wikipediaURL}
					isBold={true}
					target='_blank'
					theme={$_linkTheme0}
				>
					<Icon
						fill='black'
						glyph={WikipediaLogo}
						size=24
						stroke='none'
					/>
				</HyperLink>
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
		background-color: white;
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
