export default {
	initial: 'Idle',
	states: {
		Idle: {
			entry: 'computeOrgs',
			on: {
				TOGGLED_ORG_TYPE: {
					actions: [
						'toggleOrgType',
						'sendEdited',
						// 'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				TOGGLED_ORG_TYPE_MODE: {
					actions: [
						'toggleOrgTypeMode',
						'sendEdited',
						// 'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				EDITED_ORG_SEARCH_VALUE: {
					actions: [
						'setOrgSearchValue',
						'sendEdited',
						// 'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				EDITED_PLACES_SEARCH_VALUE: {
					actions: [
						'setPlacesSearchValue',
						'sendEdited',
						// 'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				EDITED_PLACE_IDS: {
					actions: [
						'setPlaceIds',
						'sendEdited',
						// 'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				EDITED_REGION_IDS: {
					actions: [
						'setRegionIds',
						'sendEdited',
						// 'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				EDITED_TOPIC_IDS: {
					actions: [
						'setTopicIds',
						'sendEdited',
						// 'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				/*
				UPDATED_BBOX: {
					actions: [
						'setBBox_WS_EN',
						'sendEdited',
						'computeOrgs',
						'sendCommitted'
					],
					target: 'Idle'
				},
				*/
			}
		}
	}
};
