import { assign, send, spawn } from 'xstate';
import { get } from 'svelte/store';
import { capitalize, isObjNotEmpty, negate } from '@svizzle/utils';

import { bucketLabels } from 'elasticsearch/config/aggsLabels';

import { bindToStore } from '../utils';
import { createFormStores } from './form.context';
import { formTemplate } from './form';

const AXIS_NAMES = [
	'primary',
	'secondary',
	'tertiary',
	'quaternary',
	'quinary',
	'senary',
	'septenary',
	'octonary',
	'nonary',
	'denary'
];

function createForm (ctx, id, arrayIndex) {
	const machine = formTemplate.withContext({
		...ctx,
		id,
		arrayIndex,
		...createFormStores(),
	});
	const interpreter = spawn(machine, id);
	const newForm = {
		id,
		text: capitalize(id),
		value: arrayIndex,
		disabled: false,
		machine: bindToStore(interpreter),
	};
	return newForm;
}

function spawnNestedForm (ctx) {
	const forms = get(ctx.forms);
	const arrayIndex = forms.length;
	const selectedForm = get(ctx.selectedForm);
	if (!selectedForm || selectedForm.value + 1 === arrayIndex) {
		const nextName = AXIS_NAMES[arrayIndex];
		const newForm = createForm(ctx, nextName, arrayIndex);
		ctx.forms.set([
			...forms,
			newForm
		]);
		!selectedForm && ctx.selectedForm.set(newForm);
	}
}

function deleteNestedForms (ctx, event) {
	const forms = get(ctx.forms);
	let index = ctx.arrayIndex;
	if (event.formId) {
		index = forms.findIndex(f => f.id === event.formId);
	}
	if (index === undefined) {
		return ctx;
	}
	const formsToStop = forms.slice(index + 1);
	formsToStop.forEach(f => f.machine.send('DISCARDED'));
	const newFormsArray = forms.slice(0, index + 1);
	ctx.forms.set(newFormsArray);
	return ctx;
}

function configureSubforms (ctx, event) {
	const { selection } = event;
	if (selection.aggregation in bucketLabels) {
		spawnNestedForm(ctx, event);
	} else {
		deleteNestedForms(ctx, event);
	}
}

function selectForm (ctx, event) {
	const forms = get(ctx.forms);
	const form = event.form || forms[0];
	ctx.selectedForm.set(form);
	form.machine.send('ACTIVATED');
	return ctx;
}

function resetForms (ctx) {
	const forms = get(ctx.forms);
	forms.forEach(f => f.machine.send('DISCARDED'));
	ctx.selectedForm.set(undefined);
	ctx.forms.set([]);
	ctx.dataset.set(null);
	return ctx;
}

export function parseParams (routeMachine, event) {
	routeMachine.send('PARSING_START');
	routeMachine.send('TYPINGS_CHANGED', {
		datasetTypings: event.datasetTypings
	});
	routeMachine.send('FORM_ADDED');

	if (event.query) {
		const q = event.query;
		routeMachine.send('DATASET_CHANGED', {dataset: q.dataset});
		routeMachine.send('RESULT_SIZE_CHANGED', {resultSize: q.size});
		q.forms.forEach(form => {
			const forms = get(get(routeMachine).context.forms);
			const newForm = forms[forms.length - 1];
			newForm.text = capitalize(form.name);
			newForm.machine.send('RENAME', {
				name: form.name
			});
			routeMachine.send('FORM_SELECTED', {form: newForm})
			if (q.dataset || form.selection && isObjNotEmpty(form.selection)) {
				newForm.machine.send('SELECTION_CHANGED', {
					selection: form.selection,
					dataset: q.dataset
				});
			}
			if (form.params && isObjNotEmpty(form.params)) {
				newForm.machine.send('QUERY_CHANGED',{
					params: form.params
				});
			}
		});
		const form = get(get(routeMachine).context.forms).find(f => f.id === q.form);
		if (form) {
			routeMachine.send('FORM_SELECTED', {form});
		}
	}
	routeMachine.send('PARSING_DONE');
}

function setTab (ctx, event) {
	ctx.selectedRequestTab.set(event.selectedRequestTab);
	return ctx
}

function setTypings (ctx, event) {
	ctx.datasetTypings = event.datasetTypings;
	return ctx
}

function setDataset (ctx, event) {
	ctx.dataset.set(event.dataset);
	return ctx
}

function setResultSize (ctx, event) {
	ctx.resultSize.set(event.resultSize);
	return ctx
}

export const formEditingOptions = {
	actions: {
		/**
		 * Initialize the context
		 */
		selectForm: assign(selectForm),
		/**
		 * Creates a new form for configuring a subaggregation
		 */
		configureSubforms: assign(configureSubforms),
		/**
		 * Delete nested forms if the configuration becomnes invalid.
		 */
		deleteNestedForms: assign(deleteNestedForms),
		/**
		 * Creates a new form for configuring a subaggregation
		 */
		spawnNestedForm: assign(spawnNestedForm),
		/**
		 * Resets all forms
		 */
		resetForms: assign(resetForms),
		/**
		 * Sets the dataset during page loading and reloading.
		 */
		setDataset: assign(setDataset),
		/**
		 * Sets the result size during page loading and reloading.
		 */
		setResultSize: assign(setResultSize),
		/**
		 * Selects the editor tab.
		 */
		setTab: assign(setTab),
		/**
		 * Sets the dataset typings during page loading.
		 */
		setTypings: assign(setTypings),
		setParsing: assign(ctx => {
			ctx.isParsing.set(true);
			return ctx;
		}),
		setParsingDone: assign(ctx => {
			ctx.isParsing.set(false);
			return ctx;
		}),
		sendEdited: send('EDITED'),
		sendTreeChanged: send('TREE_CHANGED', {
			to: (ctx, event) => {
				const forms = get(ctx.forms);
				const form = forms.find(f => f.id === event.formId);
				const subForm = forms[get(form.machine).context.arrayIndex + 1];
				return subForm ? subForm.id : undefined;
			}
		}),
		/**
		 * Toggles auto-executing requests when the query is valid
		 */
		toggleAutoExecute: ctx => ctx.runQueryOnSelect.update(negate),
		/**
		 * Hide unselectable axes. Default: true
		 */
		toggleHideDisabledForms: ctx => ctx.hideDisabledForms.update(negate),
		/**
		 * Hide unselectable aggregations. Default: false
		 */
		toggleHideDisabledAggs: ctx => ctx.hideDisabledAggregations.update(negate),
		/**
		 * Hide unselectable datasets. Default: false
		 */
		toggleHideDisabledDatasets: ctx => ctx.hideDisabledDatasets.update(negate),
		/**
		 * Hide unselectable fields. Default: true
		 */
		toggleHideDisabledFields: ctx => ctx.hideDisabledFields.update(negate),
		/**
		 * Show full response or only aggregation results.
		 */
		toggleShowFullResponse: ctx => ctx.showFullResponse.update(negate),
	},
	guards: {
	}
};
