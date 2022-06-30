<script>
	import {isClientSide} from '@svizzle/ui/src/utils/env';
import { stringify } from '@svizzle/utils';

	import Pill from 'app/components/orgs/Pill.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';
	import {_deviceId} from 'app/stores/device';
	import {_currentOrg, loadNextOrg } from 'app/stores/eval';
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

	const getNextEntity = () => {
		const next = entitiesIterator.next();
		// eslint-disable-next-line prefer-destructuring
		const value = next.value?.[1];
		console.log('value', value);
		return value;
	};

	const addEvaluation = (URI, value) => {
		evaluations = {
			...evaluations,
			[URI]: value
		};
	};

	const sendOrg = async () => {
		console.log($_deviceId, $_currentOrg._id, evaluations);
		await sendEvaluations($_deviceId, $_currentOrg._id, evaluations);
		evaluations = {};
		await loadNextOrg();
		console.log('sent');
	};

	const onVoteClick = vote => {
		addEvaluation(currentEntity.URI, vote);
		currentEntity = getNextEntity();
		console.log('vote', evaluations);
	};

	$: isClientSide && !$_currentOrg && loadNextOrg();
	$: if ($_currentOrg) {
		source = $_currentOrg._source;
		entities = source.dbpedia_entities;
		console.log('org', $_currentOrg)
		entitiesIterator = entities.entries();
		currentEntity = getNextEntity();
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
	<LayoutHMF>
		<div slot='header'>
			User: {$_deviceId}
		</div>
		<div class='main' slot='main'>
			<p>
				{@html description}
			</p>
		</div>
		<div slot='footer' class='footer'>
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
	</LayoutHMF>
	<pre>{JSON.stringify(evaluations, null, 2)}</pre>
</div>

<style>
	.footer {
		display: grid;
		grid-template-columns: 1fr, 1fr;
	}
	:global(.eval .main p span) {
		background: yellow;
	}
</style>
