import {writable} from 'svelte/store';

import {makeTopicDetailsStoreUpdaters} from 'app/utils/topics';

export const _activeTopicDetails = writable();

export const {
	asyncUpdateTopicDetails,
	clearActiveTopic
} = makeTopicDetailsStoreUpdaters(_activeTopicDetails);
