import * as _ from 'lamb';
import { isObjNotEmpty, isNotNil } from '@svizzle/utils';
import { get } from 'svelte/store';
import rison from 'rison-esm';

const pickNonNil = _.pickIf(isNotNil);

function formData (machine) {
	const data = {
		name: machine.context.id,
	}
	const selection = get(machine.context.selection);

	if (selection && isObjNotEmpty(selection)) {
		const result = pickNonNil(selection);
		isObjNotEmpty(result) && (data.selection = result);
	}
	const params = get(machine.context.params);
	params && isObjNotEmpty(params) && (data.params = params);
	return data;
}

function collectConfiguration (ctx) {
	const config = {
		size: get(ctx.resultSize),
		form: get(get(ctx.selectedForm).machine).context.id,
		forms: get(ctx.forms).map(form => formData(get(form.machine))),
	}

	const dataset = get(ctx.dataset);
	dataset && (config.dataset = dataset);
	return config;
}

function updateEntry (ctx, event) {
	if (get(ctx.isParsing)) {
		return;
	}
	const query = rison.encode(collectConfiguration(ctx));
	const url = `${window.location.pathname}?q=${query}`;
	let updateType = event.init
		? 'pushState'
		: 'replaceState';
	if (url === ctx.lastGoodURL) {
		updateType = 'replaceState';
	}
	history[updateType](null, window.title, url);
}

export const historyOptions = {
	actions: {
		/**
		 * When editing starts reserves a history slot for the session
		 */
		initEntry: ctx => updateEntry(ctx, {init: true}),
		/**
		 * Updates the history slot on edits
		 */
		updateEntry,
		commitLastGoodURL: ctx => {
			ctx.lastGoodURL = location.pathname + location.search;
		}
	},
	guards: {
		isActiveForm: (ctx, event) => {
			const selectedForm = get(ctx.selectedForm);
			return selectedForm && selectedForm.id === event.formId;
		}
	}
};
