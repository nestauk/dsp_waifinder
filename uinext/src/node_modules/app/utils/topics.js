import {get} from 'svelte/store';

import {fetchEntityDetail} from 'app/utils/dbpedia';
import {getTopicLabel} from 'app/utils/dataUtils';

const topicsCache = {};

export const makeTopicDetailsStoreUpdaters = _store => {

	const asyncUpdateTopicDetails = async id => {

		/* inform consumers data is loading */

		_store.set({
			id,
			isLoading: true
		});

		/* get it from cache or fetch it and cache it */

		let topicDetails =  topicsCache[id];
		if (!topicDetails) {
			topicDetails = {
				id,
				label: getTopicLabel(id),
				...await fetchEntityDetail(id)
			};
			topicsCache[id] = topicDetails;
		}

		/* assign details */

		const currentTopicDetails = get(_store);
		if (id === currentTopicDetails?.id) {
			_store.set(topicDetails);
		}
	}

	const clearActiveTopic = () => {
		_store.set(null);
	}

	return {
		asyncUpdateTopicDetails,
		clearActiveTopic
	}
}
