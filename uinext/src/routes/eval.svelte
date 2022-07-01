<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import Pill from 'app/components/orgs/Pill.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';
	import TopicBanner from 'app/components/banners/TopicBanner.svelte';
	import {_deviceId} from 'app/stores/device';
	import {_currentOrg, loadNextOrg } from 'app/stores/eval';
	import {
		_activeTopicDetails,
		asyncUpdateTopicDetails,
		clearActiveTopic
	} from 'app/stores/topics';
	import {getTopicLabel, getFirstPhrases} from 'app/utils/dataUtils';
	import {sendEvaluations} from 'app/utils/eval';


	let currentEntity;
	let description;
	let entities;
	let entitiesIterator;
	let id;
	let label;
	let score;
	let source;
	let evaluations = {};
	let isImgErrored = false;
	let isLoading;

	const notifyImgError = () => {
		isImgErrored = true;
	}

	const getNextEntity = () => {
		const next = entitiesIterator.next();
		// eslint-disable-next-line prefer-destructuring
		const value = next.value?.[1];
		return value;
	};

	const addEvaluation = (URI, value) => {
		evaluations = {
			...evaluations,
			[URI]: value
		};
	};

	const sendOrg = async () => {
		isLoading = true;
		await sendEvaluations($_deviceId, $_currentOrg._id, evaluations);
		evaluations = {};
		await loadNextOrg();
	};

	const onVoteClick = vote => {
		addEvaluation(currentEntity.URI, vote);
		currentEntity = getNextEntity();
	};

	$: if (isClientSide && !$_currentOrg) {
		isLoading = true;
		loadNextOrg();
	}
	$: if ($_currentOrg) {
		isLoading = false;
		source = $_currentOrg._source;
		entities = source.dbpedia_entities;
		entitiesIterator = entities.entries();
		currentEntity = getNextEntity();
	}
	$: if (currentEntity) {
		description = source.description.replace(
			currentEntity.surfaceForm,
			`<span>${currentEntity.surfaceForm}</span>`
		);
		score = currentEntity.confidence;
		id = currentEntity.URI.replace('http://dbpedia.org/resource/', '');
		label = getTopicLabel(id);
		asyncUpdateTopicDetails(id);
	} else if ($_currentOrg) {
		description = source.description;
		clearActiveTopic();
	}

	$: abstract = $_activeTopicDetails?.abstract
		? getFirstPhrases($_activeTopicDetails.abstract, 300)
		: 'No info';
	$: thumbnailURL = $_activeTopicDetails?.thumbnailURL;
</script>

<div class='eval {$_screen?.classes}'>
	{#if isLoading}
		<div class='loadPanel'>
			<LoadingView />
		</div>
	{:else}
		<LayoutHMF>
			<div slot='header'>
				User: {$_deviceId}
			</div>
			<div class='main' slot='main'>
				<p>
					{@html description}
				</p>
				<div class='controls'>
					{#if currentEntity}
						<div class='topicPill'>
							<Pill
								{label}
								{score}
							/>
						</div>
						<div class='options'>
									<button on:click={() => onVoteClick('keep')}>Keep</button>
									<button on:click={() => onVoteClick('dismiss')}>Dismiss</button>
									<button on:click={() => onVoteClick('dunno')}>Not sure</button>
						</div>
					{:else}
						<div class='options'>
							<button on:click={sendOrg}>Next</button>
						</div>
					{/if}
					<div class='topicDetails'>
						{#if $_activeTopicDetails}
							{#if $_activeTopicDetails.isLoading}
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
					</div>
				</div>
			</div>
		</LayoutHMF>
	{/if}
</div>

<style>
	.main {
		padding: 1em;
	}

	.controls {
		align-items: center;
		display: grid;
		justify-items: center;
		padding-top: 1em;
	}

	.small:not(.medium) .controls {
		grid-template-areas:
			"topicPill"
			"topicDetails"
			"options";
	}

	.medium .controls {
		grid-template-areas:
			"topicPill options"
			"topicDetails topicDetails";
	}

	.eval {
		width: 100%;
		height: 100%;
	}
	.loadPanel {
		width: 100%;
		height: 100%;
		display: grid;
		align-items: center;
		justify-items: center;
	}

	.topicPill {
		grid-area: topicPill;
	}
	.topicDetails {
		grid-area: topicDetails;
	}
	.options {
		padding: 1em;
		white-space: nowrap;
		grid-area: options;
	}

	:global(.eval .main p span) {
		background: yellow;
	}

	img {
		float: right;
		margin: 0.5em;
		max-height: 10em;
		max-width: 50%;
	}
</style>
