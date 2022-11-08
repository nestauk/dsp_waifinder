import {isNotNil, isIterableNotEmpty} from '@svizzle/utils';
import isEqual from 'just-compare';
import * as _ from 'lamb';
import {get} from 'svelte/store';
import {send} from 'xstate/lib/actions';

import {nutsLevel} from '$lib/config';
import {
	_isPlacesEditMode,
	_isRegionsEditMode,
	_isTopicsEditMode,
	_orgSearchRegex,
	_orgSearchValue,
	_orgTypesSelectionMode,
	_placesSearchRegex,
	_placesSearchValue,
	_selectedOrgTypes,
	_selectedRegionIds,
	_selectedTopicIds,
	toggleOrgType,
	_selectedPlaceIds,
} from '$lib/stores/selection';
import {_allOrgs} from '$lib/stores/data';
import {_dataset} from '$lib/stores/dataset';
import {isRegexpNotEmpty} from '$lib/utils/svizzle/utils';

const makeIsOrgOfTypes = (selectedTypes, selectionMode) =>
	({types}) => {
		let passed;

		if (selectionMode === 'OR') {
			const isSelectedType = x => selectedTypes.includes(x); // FIXME [1]
			passed = _.someIn(types, isSelectedType);
		} else {
			// orgs that are JUST a company or that are BOTH a company & a funder
			// NOTE relies on both array being previously sorted

			passed = isEqual(types, selectedTypes);
		}

		return passed;
	}

const makeIsTextInOrg = regexp =>
	({name, description}) =>
		isNotNil(name?.match(regexp) || description?.match(regexp));

const makeIsOrgInPlace = regexp =>
	({place: {name} }) => isNotNil(name?.match(regexp));

export default {
	toggleOrgType: (ctx, {id}) => {
		toggleOrgType(id);
	},
	toggleOrgTypeMode: (ctx_, {orgTypesSelectionMode}) => {
		_orgTypesSelectionMode.set(orgTypesSelectionMode);
	},
	setOrgSearchValue: (ctx, {orgSearchValue}) => {
		_orgSearchValue.set(orgSearchValue);
	},
	setPlacesSearchValue: (ctx, {placesSearchValue}) => {
		_placesSearchValue.set(placesSearchValue);
	},
	setPlaceIds: (ctx, {selectedPlaceIds}) => {
		_selectedPlaceIds.set(selectedPlaceIds);
	},
	setRegionIds: (ctx, {selectedRegionIds}) => {
		_selectedRegionIds.set(selectedRegionIds);
	},
	setTopicIds: (ctx, {selectedTopicIds}) => {
		_selectedTopicIds.set(selectedTopicIds);
	},
	/*
	setBBox_WS_EN: (ctx, {bbox_WS_EN}) => {
		_bbox_WS_EN.set(bbox_WS_EN);
	},
	*/
	computeOrgs: () => {
		console.log('blah');

		const {orgs} = get(_dataset);

		const isPlacesEditMode = get(_isPlacesEditMode); //
		const isRegionsEditMode = get(_isRegionsEditMode); //
		const isTopicsEditMode = get(_isTopicsEditMode); //
		const orgSearchRegex = get(_orgSearchRegex); //
		const orgTypesSelectionMode = get(_orgTypesSelectionMode); //
		const placesSearchRegex = get(_placesSearchRegex); //
		const selectedOrgTypes = get(_selectedOrgTypes); //
		const selectedPlaceIds = get(_selectedPlaceIds);
		const selectedRegionIds = get(_selectedRegionIds);
		const selectedTopicIds = get(_selectedTopicIds);

		const predicates = [
			makeIsOrgOfTypes(selectedOrgTypes, orgTypesSelectionMode)
		];

		if (!isPlacesEditMode && isIterableNotEmpty(selectedPlaceIds)) {
			predicates.push(
				({place_id}) => _.isIn(selectedPlaceIds, place_id)
			);
		}
		if (!isRegionsEditMode && isIterableNotEmpty(selectedRegionIds)) {
			predicates.push(
				({place}) => _.isIn(selectedRegionIds, place.region[nutsLevel].id)
			);
		}

		if (!isTopicsEditMode && isIterableNotEmpty(selectedTopicIds)) {
			predicates.push(
				({topicIds}) => {
					const intersection = _.intersection(selectedTopicIds, topicIds);
					const pass = isIterableNotEmpty(intersection);

					// AND
					// const hasAllSelectedTopics = _.every(makeIsIncluded(topicIds));
					// const pass = hasAllSelectedTopics(selectedTopicIds);

					return pass;
				}
			)
		}

		if (isRegexpNotEmpty(orgSearchRegex)) {
			predicates.push(makeIsTextInOrg(orgSearchRegex));
		}
		if (isRegexpNotEmpty(placesSearchRegex)) {
			predicates.push(makeIsOrgInPlace(placesSearchRegex));
		}

		_allOrgs.set(_.filter(orgs, _.allOf(predicates)));
	},
	sendCommitted: send('COMMITTED'),
	sendEdited: send('EDITED')
};
