export const formEditingConfig = {
	initial: 'Idle',
	states: {
		Idle: {
			on: {
				AUTO_EXEC_TOGGLED: {
					target: 'Idle',
					actions: ['toggleAutoExecute','log']
				},
				DATASET_CHANGED: {
					target: 'Idle',
					actions: ['setDataset']
				},
				FORM_ADDED: {
					target: 'Idle',
					actions: ['spawnNestedForm']
				},
				SELECTION_COMPLETED: {
					target: 'Idle',
					actions: ['configureSubforms']
				},
				SELECTION_INCOMPLETE: {
					target: 'Idle',
					actions: ['deleteNestedForms']
				},
				FORM_SELECTED: {
					target: 'Idle',
					actions: [
						'selectForm',
						'sendEdited'
					]
				},
				HIDE_DISABLED_FORMS_TOGGLED: {
					target: 'Idle',
					actions: ['toggleHideDisabledForms']
				},
				HIDE_DISABLED_AGGS_TOGGLED: {
					target: 'Idle',
					actions: ['toggleHideDisabledAggs']
				},
				HIDE_DISABLED_DSETS_TOGGLED: {
					target: 'Idle',
					actions: ['toggleHideDisabledDatasets']
				},
				HIDE_DISABLED_FIELDS_TOGGLED: {
					target: 'Idle',
					actions: ['toggleHideDisabledFields']
				},
				REQUEST_TAB_SELECTED: {
					target: 'Idle',
					actions: ['setTab']
				},
				RESULT_SIZE_CHANGED: {
					target: 'Idle',
					actions: ['setResultSize']
				},
				SHOW_FULL_RESPONSE_TOGGLED: {
					target: 'Idle',
					actions: ['toggleShowFullResponse']
				},
				TYPINGS_CHANGED: {
					target: 'Idle',
					actions: ['setTypings']
				},
				PARSING_START: {
					target: 'Idle',
					actions: ['setParsing']
				},
				PARSING_DONE: {
					target: 'Idle',
					actions: ['setParsingDone']
				},
				FORM_CHANGED: {
					target: 'Idle',
					actions: ['sendTreeChanged']
				}
			}
		}
	}
};
