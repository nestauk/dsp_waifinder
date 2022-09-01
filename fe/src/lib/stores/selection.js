import {toggleItem} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived, get, writable} from 'svelte/store';

import {safeRegexOf} from '$lib/utils/svizzle/utils';

/* bounding box, zoom */

const bbox_WS_EN_UK = [
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
