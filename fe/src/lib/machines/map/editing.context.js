// import { writable } from 'svelte/store';

import {defaults as selectionDefaults} from 'app/stores/dataset';

export function createEditingStores () {
	return {
		...selectionDefaults
		/*
		// interaction
		_hero: writable(),

		// navigation
		_activeViewId: writable(),

		// selection
		_bbox: writable(),
		_orgSearchValue: writable(),
		_orgTypesSelectionMode: writable(),
		_placesSearchValue: writable(),
		*/
		/*

		// topics
		_activeTopicDetails: writable(),
		*/
	}
}
