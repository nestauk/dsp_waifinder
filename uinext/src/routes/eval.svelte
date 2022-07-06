<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import StorageIO from '@svizzle/ui/src/io/storage/StorageIO.svelte';

	import EmailForm from 'app/components/eval/EmailForm.svelte';
	import HighlightedText from 'app/components/svizzle/HighlightedText.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';
	import Scroller from 'app/components/svizzle/Scroller.svelte';
	import TopicPanel from 'app/components/eval/TopicPanel.svelte';
	import VoteButtons from 'app/components/eval/VoteButtons.svelte';

	import {
		_currentOrg,
		_evaluatorSettings,
		_evalTopicDetails,
		asyncUpdateTopicDetails,
		clearActiveTopic,
		defaultEvaluatorSettings,
		loadNextOrg,
	} from 'app/stores/eval';
	import {_isSmallScreen} from 'app/stores/layout';
	import {getTopicLabel} from 'app/utils/dataUtils';
	import {sendEvaluations} from 'app/utils/eval';

	let currentEntity;
	let description;
	let entities;
	let entitiesIterator;
	let evaluations = {};
	let id;
	let isLoading;
	let label;
	let source;
	let surfaceFormRegex;

	const getNextEntity = () => {
		const next = entitiesIterator.next();
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

	const onVoted = ({detail: vote}) => {
		addEvaluation(currentEntity.URI, vote);
		currentEntity = getNextEntity();
	};

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
		id = currentEntity.URI.replace('http://dbpedia.org/resource/', '');
		label = getTopicLabel(id);
		asyncUpdateTopicDetails(id);
	} else if ($_currentOrg) {
		clearActiveTopic();
		sendOrg();
	}
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
		<EmailForm />
	{:else}
		{#if isLoading}
			<div class='loadPanel'>
				<LoadingView />
			</div>
		{:else}
			<LayoutHMF>
				<div slot='header'>
					{$_evaluatorSettings.userEmail}
				</div>

				<div class='main' slot='main'>
					<h2 class='question start'>
						{#if currentEntity}
							Does "<span>{label}</span>"
						{/if}
					</h2>

					<div class='details'>
						<TopicPanel topicDetails={$_evalTopicDetails} />
					</div>

					<h2 class='question end'>
						apply to this text?
					</h2>

					<div class='description'>
						<Scroller>
							<HighlightedText
								color='aqua'
								regex={surfaceFormRegex}
								shouldScrollIntoView=true
								string={description}
							/>
						</Scroller>
					</div>
					{#if !$_isSmallScreen}
						<VoteButtons
							isVerticalLayout=true
							on:voted={onVoted}
						/>
					{/if}
				</div>

				<div slot='footer'>
					{#if $_isSmallScreen}
						<VoteButtons on:voted={onVoted} />
					{/if}
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
		grid-template-areas: 'questionStart' 'details' 'questionEnd' 'description';
		grid-template-rows: min-content 1fr min-content 1fr;
		height: 100%;
		overflow: hidden;
	}

	.medium .main {
		grid-template-areas: 'questionStart questionEnd' 'details description';
		grid-template-columns: 1fr 1fr min-content;
		grid-template-rows: min-content 1fr;
	}

	.question.start {
		grid-area: questionStart;
	}
	.question.start span {
		font-style: italic;
		background-color: aqua;
	}

	.details {
		grid-area: details;
		overflow: hidden;
	}

	.description {
		grid-area: description;
		overflow: hidden;
	}

	.loadPanel {
		width: 100%;
		height: 100%;
		display: grid;
		align-items: center;
		justify-items: center;
	}
</style>
