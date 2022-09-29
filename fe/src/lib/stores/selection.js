import {isIterableNotEmpty, toggleItem} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived, get, writable} from 'svelte/store';

import {safeRegexOf} from '$lib/utils/svizzle/utils';

/* bounding box, zoom */

// TODO move to config
export const bbox_WS_EN_UK = [
	[-7.57216793459, 49.959999905],
	[1.68153079591, 58.6350001085],
];
export const _bbox_WS_EN = writable(bbox_WS_EN_UK);
export const _bbox_WSEN = derived(
	_bbox_WS_EN,
	([[w, s], [e, n]]) => [w, s, e, n]
);

export const _isOrgWithinBbox = derived(
	_bbox_WS_EN,
	([[w, s], [e, n]]) =>
		({location: {lat, lon}}) =>
			lon >= w &&
			lat >= s &&
			lon <= e &&
			lat <= n
);

export const _zoom = writable(0);

/* org types */

export const _selectedOrgTypes = writable([]);
export const toggleOrgType = type =>
	_selectedOrgTypes.update(
		orgTypes => _.sort(toggleItem(orgTypes, type))
	);

export const orgTypesSelectionModes = ['OR', 'AND'];
export const _orgTypesSelectionMode = writable(orgTypesSelectionModes[0]);
export const toggleOrgTypesSelectionMode = () => {
	let selectionMode = get(_orgTypesSelectionMode);

	if (selectionMode === orgTypesSelectionModes[0]) {
		_orgTypesSelectionMode.set(orgTypesSelectionModes[1]);
	} else {
		_orgTypesSelectionMode.set(orgTypesSelectionModes[0]);
	}
}

/* org search */

export const _orgSearchValue = writable('');
export const _orgSearchRegex = derived(_orgSearchValue, safeRegexOf);

/* place search */

export const _placesSearchValue = writable('');
export const _placesSearchRegex = derived(_placesSearchValue, safeRegexOf);

/* places selection */

export const _isPlacesEditMode = writable(false);
export const _selectedPlaceIds = writable([]);

export const _hasSelectedPlaces =
	derived(_selectedPlaceIds, isIterableNotEmpty);

export const deselectPlace = id => {
	_selectedPlaceIds.update(
		ids => _.pullFrom(ids, [id])
	);
}
export const deselectAllPlaces = () => {
	_selectedPlaceIds.set([]);
}
export const togglePlaceId = id => {
	_selectedPlaceIds.update(
		ids => toggleItem(ids, id)
	);
}

export const enterPlacesEditMode = () => {
	_isPlacesEditMode.set(true);
}
export const exitPlacesEditMode = () => {
	_isPlacesEditMode.set(false);
}

/* regions selection */

export const _isRegionsEditMode = writable(false);
export const _selectedRegionIds = writable([]);

export const _hasSelectedRegions =
	derived(_selectedRegionIds, isIterableNotEmpty);

export const deselectRegion = id => {
	_selectedRegionIds.update(
		ids => _.pullFrom(ids, [id])
	);
}
export const deselectAllRegions = () => {
	_selectedRegionIds.set([]);
}
export const toggleRegionId = id => {
	_selectedRegionIds.update(
		ids => toggleItem(ids, id)
	);
}

export const enterRegionsEditMode = () => {
	_isRegionsEditMode.set(true);
}
export const exitRegionsEditMode = () => {
	_isRegionsEditMode.set(false);
}

/* topics selection */

export const _isTopicsEditMode = writable(false);
export const _selectedTopicIds = writable([]);

export const _hasSelectedTopics =
	derived(_selectedTopicIds, isIterableNotEmpty);

export const deselectTopic = id => {
	_selectedTopicIds.update(
		ids => _.pullFrom(ids, [id])
	);
}
export const deselectAllTopics = () => {
	_selectedTopicIds.set([]);
}
export const toggleTopicId = id => {
	_selectedTopicIds.update(
		ids => toggleItem(ids, id)
	);
}

export const enterTopicsEditMode = () => {
	_isTopicsEditMode.set(true);
}
export const exitTopicsEditMode = () => {
	_isTopicsEditMode.set(false);
}
