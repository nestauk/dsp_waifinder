import * as _ from 'lamb';
import {get, writable} from 'svelte/store';

import {_isSmallScreen, _screenId} from '$lib/stores/layout';
import {exitPlacesEditMode} from '$lib/stores/selection';

const availableViewIds = {
	medium: ['details', 'places', 'regions', 'topics']
}
const defaultActiveViewId = {
	medium: 'details',
	small: 'map'
}

export const _activeViewId = writable();

export const setDefaultActiveView = () => {
	const screenId = get(_screenId);
	_activeViewId.set(defaultActiveViewId[screenId]);
}

export const setActiveView = id => {
	const isSmallScreen = get(_isSmallScreen);
	const newId = isSmallScreen || _.isIn(availableViewIds.medium, id)
		? id || defaultActiveViewId.small
		: defaultActiveViewId.medium

	if (newId !== 'places') {
		exitPlacesEditMode();
	}

	_activeViewId.set(newId);
}
