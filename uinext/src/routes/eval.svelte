<script>
	import * as _ from 'lamb';
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import StorageIO from '@svizzle/ui/src/io/storage/StorageIO.svelte';
	import {getTruthyValuesKeys} from '@svizzle/utils';

	import TopicPanel from 'app/components/eval/TopicPanel.svelte';
	import VoteButtons from 'app/components/eval/VoteButtons.svelte';
	import HighlightedText from 'app/components/svizzle/HighlightedText.svelte';
	import EmailWidget from 'app/components/svizzle/EmailWidget.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';
	import Scroller from 'app/components/svizzle/Scroller.svelte';

	import {
		_currentOrg,
		_evalTopicDetails,
		_userEmail,
		asyncUpdateTopicDetails,
		clearActiveTopic,
		defaultUserEmail,
		loadNextOrg,
	} from 'app/stores/eval';
	import {_isSmallScreen} from 'app/stores/layout';
	import {getTopicLabel} from 'app/utils/dataUtils';
	import {dbrPrefix} from 'app/utils/dbpedia';
	import {sendEvaluations} from 'app/utils/eval';
	import {regexOf} from 'app/utils/svizzle/utils';

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
	let startTimeStamp;

	const {timeZone} = Intl.DateTimeFormat().resolvedOptions();

	const getNextEntity = () => {
		const next = entitiesIterator.next();
		const value = next.value?.[1];
		return value;
	};

	const getNextOrg = async () => {
		const nextOrg = await loadNextOrg();
		startTimeStamp = Date.now();
		return nextOrg;
	}
	const sendOrg = async () => {
		isLoading = true;
		await sendEvaluations(
			$_userEmail,
			$_currentOrg._id,
			evaluations
		);
		evaluations = {};
		await getNextOrg();
	};

	const addEvaluation = (URI, value) => {
		evaluations = {
			...evaluations,
			[URI]: value
		};
	};

	const orderedSizes = ['xLarge', 'large', 'medium', 'small'];
	const getScreenType = types => {
		if (types.xSmall) {
			return 'xSmall';
		}
		return _.pipe([
			_.mapWith(key => [key, types[key]]),
			_.filterWith(([_, value]) => value),
			_.getPath('0.0')
		])(orderedSizes);
	};
	const getOrientation = _.pipe([
		getTruthyValuesKeys,
		_.pairs,
		_.getPath('0.1')
	])

	const onVoted = (vote, inputType) => {
		const submitTimestamp = Date.now();
		const payload = {
			vote,
			score: currentEntity.confidence,
			submitTimestamp,
			timeZone,
			judgementDuration: submitTimestamp - startTimeStamp,
			inputType,
			screenType: getScreenType($_screen.sizes),
			screenOrientation: getOrientation($_screen.orientations),
			screenAspectRatio: $_screen.display.aspectRatio,
		};
		console.log(payload);
		addEvaluation(currentEntity.URI, payload);
		currentEntity = getNextEntity();
	};

	const onPointerVoted = ({detail: vote}) => onVoted(vote, 'pointer');
	const onKeyboardVoted = ({detail: vote}) => onVoted(vote, 'keyboard');

	const onEmailSubmitted = ({detail: userEmail}) => {
		$_userEmail = userEmail;
	}

	$: if (isClientSide && !$_currentOrg && $_userEmail) {
		isLoading = true;
		getNextOrg();
	}
	$: if ($_currentOrg) {
		isLoading = false;
		source = $_currentOrg._source;
		entities = source.dbpedia_entities;
		entitiesIterator = entities.entries();
		currentEntity = getNextEntity();
		({description} = source);
		surfaceFormRegex = regexOf('');
	}
	$: if (currentEntity) {
		surfaceFormRegex = regexOf(currentEntity.surfaceForm);
		id = currentEntity.URI.replace(dbrPrefix, '');
		label = getTopicLabel(id);
		asyncUpdateTopicDetails(id);
	} else if ($_currentOrg) {
		clearActiveTopic();
		sendOrg();
	}
</script>

<StorageIO
	_store={_userEmail}
	defaultValue={defaultUserEmail}
	isReactive={true}
	key='userEmail'
	type='localStorage'
/>

<div class='eval {$_screen?.classes}'>
	{#if !$_userEmail}
		<EmailWidget
			buttonText='Start'
			on:emailSubmitted={onEmailSubmitted}
		/>
	{:else}
		{#if isLoading}
			<div class='loadPanel'>
				<LoadingView />
			</div>
		{:else}
			<LayoutHMF>
				<div slot='header'>
					{$_userEmail}
				</div>

				<div
					class='main'
					slot='main'
				>
					<h2 class='question start'>
						{#if currentEntity}
							Does "<span class='highlight'><span>{label}</span></span>"
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
						<div class='controls'>
							<VoteButtons
								isVerticalLayout=true
								on:voted={onPointerVoted}
							/>
						</div>
					{/if}
				</div>

				<div slot='footer'>
					{#if $_isSmallScreen}
						<VoteButtons on:voted={onKeyboardVoted} />
					{/if}
				</div>
			</LayoutHMF>
		{/if}
	{/if}
</div>

<style>
	.eval {
		height: 100%;
		width: 100%;
	}
	.main {
		display: grid;
		grid-template-areas: 'questionStart' 'details' 'questionEnd' 'description';
		grid-template-rows: min-content 1fr min-content 1fr;
		height: 100%;
		overflow: hidden;
		padding: 1em;
	}

	.medium .main {
		column-gap: 2em;
		grid-template-areas: 'questionStart questionEnd controls' 'details description controls';
		grid-template-columns: 1fr 1fr min-content;
		grid-template-rows: min-content 1fr;
		padding: 2em;
	}

	.question.start {
		grid-area: questionStart;
	}
	.question.start .highlight {
		background-color: aqua;
		font-style: italic;
	}
	/* To keep glyph descenders uncovered on multiline highlights wrap two
	 * <span>s and set the inner one to relative position to force the
	 * background to render before the glyphs.
	 */
	.question.start .highlight > span {
		position: relative;
	}

	.details {
		grid-area: details;
		margin-bottom: 1em;
		overflow: hidden;
	}

	.description {
		grid-area: description;
		overflow: hidden;
	}

	.controls {
		grid-area: controls;
		padding-left: 1em;
	}

	.loadPanel {
		align-items: center;
		display: grid;
		height: 100%;
		justify-items: center;
		width: 100%;
	}
</style>
