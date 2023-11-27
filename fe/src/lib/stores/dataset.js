import {getId, swapKeyValue} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';

import {nutsLevel} from '$lib/config.js';
import {_selectedOrgTypes} from '$lib/stores/selection.js';
import {getName} from '$lib/utils/dataUtils.js';

export const _dataset = writable({
	isEmpty: true,
	orgs: [],
	orgsById: {},
	orgTypeByIndex: {},
	orgTypeIndexByType: {},
	orgTypes: [],
	placesById: {},
	regionsByLevelById: {},
});

export const updateDataset = ({
	org_types,
	orgs,
	placesById,
	regionsByLevelById
}) => {
	const sortedOrgs = _.sort(orgs, [getName]);
	const augmentedOrgs = _.map(sortedOrgs,
		({place_id, types, ...others}) => ({
			place_id,
			place: placesById[place_id],
			types: _.map(types, typeId => org_types[typeId]),
			...others
		})
	);
	const orgsById = _.index(augmentedOrgs, getId);
	const orgTypes = _.sort(_.values(org_types));
	const orgTypeIndexByType = swapKeyValue(org_types);

	_dataset.set({
		isEmpty: false,
		orgs: augmentedOrgs,
		orgsById,
		orgTypeByIndex: org_types,
		orgTypeIndexByType,
		orgTypes,
		placesById,
		regionsByLevelById,
	});

	_selectedOrgTypes.set(orgTypes);
};

export const _placeIdToLabel = derived(
	_dataset,
	({placesById}) => id => placesById[id].name
);

export const _regionIdToLabel = derived(
	_dataset,
	({regionsByLevelById}) => id => regionsByLevelById[nutsLevel][id].name
);
