import * as _ from 'lamb';
import rison from 'rison';
import { get } from 'svelte/store';
import {assign} from 'xstate/lib/actions';
import {
	_bbox_WS_EN,
	_orgSearchValue,
	_orgTypesSelectionMode,
	_placesSearchValue,
	_selectedOrgTypes
} from 'app/stores/selection';

const collectParams = () => ({
	bbox_WS_EN: get(_bbox_WS_EN),
	orgSearchValue: get(_orgSearchValue),
	orgTypesSelectionMode: get(_orgTypesSelectionMode),
	selectedOrgTypes: get(_selectedOrgTypes),
	placesSearchValue: get(_placesSearchValue)
});

function updateEntry (ctx, event) {
	const query = rison.encode(collectParams());
	const url = `${window.location.pathname}?q=${query}`;
	let updateType = event.init
		? 'pushState'
		: 'replaceState';
	if (url === ctx.lastGoodURL) {
		updateType = 'replaceState';
	}
	history[updateType](null, window.title, url);
	// goto(url) // TBD
}

export default {
	/**
	 * When editing starts reserves a history slot for the session
	 */
	initEntry: ctx => updateEntry(ctx, {init: true}),
	/**
	 * Updates the history slot on edits
	 */
	updateEntry,

	commitLastGoodURL: assign(() => ({
		lastGoodURL: location.pathname + location.search
	}))
};
