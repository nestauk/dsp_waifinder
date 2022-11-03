export default {
	initial: 'Idle',
	states: {
		Idle: {
			on: {
				TOGGLED_ORG_TYPE: {
					actions: [
						'toggleOrgType',
						'sendEdited',
						'computeOrgs',
						'sendCommitted'
						// 'navigate'
					],
					target: 'Idle'
				},
				TOGGLED_ORG_TYPE_MODE: {
					actions: [
						'toggleOrgTypeMode',
						'sendEdited',
						'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				EDITED_ORG_SEARCH_VALUE: {
					actions: [
						'setOrgSearchValue',
						'sendEdited',
						'computeOrgs'
					],
					target: 'Idle'
				},
				EDITED_PLACES_SEARCH_VALUE: {
					actions: [
						'setPlacesSearchValue',
						'sendEdited',
						'computeOrgs'
					],
					target: 'Idle'
				},
				UPDATED_BBOX: {
					actions: [
						'setBBox_WS_EN',
						'sendEdited',
						'computeOrgs'
					],
					target: 'Idle'
				},
			}
		}
	}
};
