<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import StorageIO from '@svizzle/ui/src/io/storage/StorageIO.svelte';

	import Pill from 'app/components/orgs/Pill.svelte';
	import HighlightedText from 'app/components/svizzle/HighlightedText.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';
	import Scroller from 'app/components/svizzle/Scroller.svelte';
	// import {_deviceId} from 'app/stores/device';
	import {
		_currentOrg,
		_evaluatorSettings,
		defaultEvaluatorSettings,
		loadNextOrg
	} from 'app/stores/eval';
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
	let surfaceFormRegex;
	let evaluations = {};
	let isImgErrored = false;
	let isLoading;
	let userEmail = '';

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
		await sendEvaluations(
			$_evaluatorSettings,
			$_currentOrg._id,
			evaluations
		);
		evaluations = {};
		await loadNextOrg();
	};

	const onVoteClick = vote => {
		addEvaluation(currentEntity.URI, vote);
		currentEntity = getNextEntity();
	};

	const onSubmitEmail = () => {
		$_evaluatorSettings = {userEmail};
		console.log($_evaluatorSettings)
	}

	const onKeyPress = e => {
		if (e.keyCode === 13) {
			e.preventDefault();
			onSubmitEmail();
		}
	}

	$: if (isClientSide && !$_currentOrg && $_evaluatorSettings) {
		isLoading = true;
		loadNextOrg();
	}
	$: if ($_currentOrg) {
		isLoading = false;
		source = $_currentOrg._source;
		entities = source.dbpedia_entities;
		entitiesIterator = entities.entries();
		currentEntity = getNextEntity();
		({description} = source);
	}
	$: if (currentEntity) {
		surfaceFormRegex = new RegExp(currentEntity.surfaceForm, 'ugi');
		score = currentEntity.confidence;
		id = currentEntity.URI.replace('http://dbpedia.org/resource/', '');
		label = getTopicLabel(id);
		asyncUpdateTopicDetails(id);
	} else if ($_currentOrg) {
		clearActiveTopic();
	}

	$: abstract = $_activeTopicDetails?.abstract
		? getFirstPhrases($_activeTopicDetails.abstract, 300)
		: 'No info';
	$: thumbnailURL = $_activeTopicDetails?.thumbnailURL;
</script>

<StorageIO
	_store={_evaluatorSettings}
	defaultValue={defaultEvaluatorSettings}
	isReactive={true}
	key='evaluatorSettings'
	type='localStorage'
/>

<div class='eval {$_screen?.classes}'>
	{#if !$_evaluatorSettings}
		<div class='emailForm'>
			<p>
				Please input your email address before evaluating topic extractions.
			</p>
			<input type='email' bind:value={userEmail} on:keypress={onKeyPress}/>
			<button on:click={onSubmitEmail}>Save</button>
		</div>
	{:else}
		{#if isLoading}
			<div class='loadPanel'>
				<LoadingView />
			</div>
		{:else}
			<LayoutHMF>

				<div slot='header'>
					e-mail: {$_evaluatorSettings.userEmail}
				</div>

				<div class='main' slot='main'>
					<div class='topicPill'>
						{#if currentEntity}
							<Pill
								{label}
								{score}
							/>
						{/if}
					</div>
					<div class='topicDetails'>
						<Scroller>
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
						</Scroller>
					</div>
					<h4>Description</h4>
					<div class='description'>
						<Scroller>
							<HighlightedText
								regex={surfaceFormRegex}
								shouldScrollIntoView=true
								string={description}
							/>
						</Scroller>
					</div>
				</div>
				<div slot='footer'>
					<div class='controls'>
						{#if currentEntity}
							<button
								on:click={() => onVoteClick('keep')}
								class='keep'
							>
								Keep
							</button>
							<button
								on:click={() => onVoteClick('dismiss')}
								class='dismiss'
							>
								Dismiss
							</button>
							<button
								on:click={() => onVoteClick('dunno')}
								class='dunno'
							>
								Not sure
							</button>
						{:else}
							<button on:click={sendOrg}>Next</button>
						{/if}
					</div>
				</div>
			</LayoutHMF>
		{/if}

	{/if}

</div>

<style>
	.eval {
		width: 100%;
		height: 100%;
	}
	.main {
		padding: 1em;
		display: grid;
		grid-template-areas: 'pill' 'details' 'sep' 'description';
		grid-template-rows: min-content 1fr min-content 1fr;
		height: 100%;
		overflow: hidden;
	}

	.topicPill {
		grid-area: pill;
		padding-bottom: 1em;
	}
	.topicDetails {
		grid-area: details;
		overflow: hidden;
	}
	h4 {
		grid-area: sep;
	}
	.description {
		grid-area: description;
		overflow: hidden;
	}

	.controls {
		align-items: center;
		display: grid;
		grid-auto-flow: column;
		justify-items: center;
		padding: 0 1em;
	}

	.loadPanel {
		width: 100%;
		height: 100%;
		display: grid;
		align-items: center;
		justify-items: center;
	}

	img {
		float: right;
		margin: 0.5em;
		max-height: 10em;
		max-width: 50%;
	}

	.controls button {
		padding: 0.5em;
		width: 6em;
	}

	.keep {
		background: greenyellow;
		border: 2px solid green;
	}
	.dismiss {
		background: rgb(255, 88, 88);
		border: 2px solid red;
	}
	.dunno {
		background: lightyellow;
		border: 2px solid yellow;
	}
</style>
