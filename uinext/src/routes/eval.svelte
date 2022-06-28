<script>
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import FingerprintJS from '@fingerprintjs/fingerprintjs';

	import Pill from 'app/components/orgs/Pill.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';
	import {_deviceId} from 'app/stores/device';
	import {getTopicLabel} from 'app/utils/dataUtils';

	import {responseSample} from 'app/utils/temp.js';

	const getDeviceId = async () => {
		$_deviceId =
			await FingerprintJS.load({monitoring: false})
			.then(fp => fp.get())
			.then(result => result.visitorId);
	}

	let currentEntityId;

	$: isClientSide && getDeviceId();

	$: source = responseSample._source;
	$: entities = source.dbpedia_entities;
	$: entities, (currentEntityId = 0);
	$: currentEntity = entities[currentEntityId];

	$: description = source.description?.replace(
		currentEntity.surfaceForm,
		`<span>${currentEntity.surfaceForm}</span>`
	);
	$: score = currentEntity.confidence;
	$: label = getTopicLabel(
		currentEntity.URI.replace('http://dbpedia.org/resource/', '')
	);
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
		</div>
	</LayoutHMF>
</div>

<style>
	.footer {
		display: flex;
	}
	:global(.eval .main p span) {
		background: yellow;
	}
</style>
