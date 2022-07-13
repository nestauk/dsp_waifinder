import { writable } from 'svelte/store';
import { DEFAULT_FIELD_DOCS, DEFAULT_AGG_DOCS } from './docs.options';

export function createFormEditingStores () {
	return {
		// config
		hideDisabledForms: writable(true),
		hideDisabledAggregations: writable(false),
		hideDisabledDatasets: writable(false),
		hideDisabledFields: writable(true),
		runQueryOnSelect: writable(true),
		selectedRequestTab: writable('fields'),
		showFullResponse: writable(false),
		// doc strings
		activeDocs: writable(DEFAULT_FIELD_DOCS),
		aggDocText: writable(DEFAULT_AGG_DOCS),
		// builder stores
		dataset: writable(null),
		forms: writable([]),
		resultSize: writable(0),
		selectedForm: writable(),
		isParsing: writable(false),
	}
}
