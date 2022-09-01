import {get, writable} from 'svelte/store';

import {getNextOrg} from 'app/utils/eval';
import {makeTopicDetailsStoreUpdaters} from 'app/utils/topics';

export const _currentOrg = writable();
export const _userEmail = writable();
export const defaultUserEmail = null;

export const loadNextOrg = async () => {
	const userEmail = get(_userEmail);
	const result = await getNextOrg(userEmail);
	_currentOrg.set(result.org);
};

export const _evalTopicDetails = writable();

export const {
	asyncUpdateTopicDetails,
	clearActiveTopic
} = makeTopicDetailsStoreUpdaters(_evalTopicDetails);
