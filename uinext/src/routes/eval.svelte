<script>
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import Pill from 'app/components/orgs/Pill.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';
	import {_deviceId} from 'app/stores/device';
	import {_currentOrg, loadNextOrg } from 'app/stores/eval';
	import {
		asyncUpdateTopicDetails,
		clearActiveTopic
	} from 'app/stores/topics';
	import {getTopicLabel} from 'app/utils/dataUtils';
	import {sendEvaluations} from 'app/utils/eval';


	let currentEntity;
	let description;
	let entities;
	let entitiesIterator;
	let label;
	let score;
	let source;
	let evaluations = {};
	let isLoading;

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
		// console.log(currentEntity)
	}
	$: if (currentEntity) {
		description = source.description.replace(
			currentEntity.surfaceForm,
			`<span>${currentEntity.surfaceForm}</span>`
		);
		score = currentEntity.confidence;
		label = getTopicLabel(
			currentEntity.URI.replace('http://dbpedia.org/resource/', '')
		);
	}
</script>

<div class='eval'>
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
					<Pill
						{label}
						{score}
					/>
					<div class='answers'>
						{#if currentEntity}
								<button on:click={() => onVoteClick('keep')}>Keep</button>
								<button on:click={() => onVoteClick('dunno')}>Not sure</button>
								<button on:click={() => onVoteClick('dismiss')}>Dismiss</button>
						{:else}
							<button on:click={sendOrg}>Next</button>
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
		grid-auto-flow: column;
		grid-template-columns: 1fr min-content;
		justify-items: center;
		padding-top: 1em;
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

	.answers {
		padding: 1em;
		white-space: nowrap;
	}

	:global(.eval .main p span) {
		background: yellow;
	}
</style>
