import {writable} from 'svelte/store';

import {makeTopicDetailsStoreUpdaters} from '$lib/utils/topics.js';

export const _activeTopicDetails = writable();

export const {
	asyncUpdateTopicDetails,
	clearActiveTopic
} = makeTopicDetailsStoreUpdaters(_activeTopicDetails);

// todo move to interaction.js
