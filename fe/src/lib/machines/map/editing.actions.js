import {isNotNil} from '@svizzle/utils';
import isEqual from 'just-compare';
import * as _ from 'lamb';
import {get} from 'svelte/store';
import {send} from 'xstate/lib/actions';

import {
	_bbox_WS_EN,
	_placesSearchValue,
	_placesSearchRegex,
	_orgSearchValue,
	_orgSearchRegex,
	_orgTypesSelectionMode,
	_selectedOrgTypes,
	toggleOrgType
} from 'app/stores/selection';
import {_bboxOrgs, _orgs} from 'app/stores/data';
import {isRegexpNotEmpty} from 'app/utils/svizzle/utils';

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
		_orgSearchValue.set(orgSearchValue)
	},
	setPlacesSearchValue: (ctx, {placesSearchValue}) => {
		_placesSearchValue.set(placesSearchValue);
	},
	setBBox_WS_EN: (ctx, {bbox_WS_EN}) => {
		_bbox_WS_EN.set(bbox_WS_EN);
	},
	computeOrgs: () => {
		console.log('blah');

		const bboxOrgs = get(_bboxOrgs);
		const orgSearchRegex = get(_orgSearchRegex);
		const orgTypesSelectionMode = get(_orgTypesSelectionMode);
		const placesSearchRegex = get(_placesSearchRegex);
		const selectedOrgTypes = get(_selectedOrgTypes);

		const predicates = [
			makeIsOrgOfTypes(selectedOrgTypes, orgTypesSelectionMode)
		];

		if (isRegexpNotEmpty(orgSearchRegex)) {
			predicates.push(makeIsTextInOrg(orgSearchRegex))
		}
		if (isRegexpNotEmpty(placesSearchRegex)) {
			predicates.push(makeIsOrgInPlace(placesSearchRegex))
		}

		_orgs.set(_.filter(bboxOrgs, _.allOf(predicates)));
	},
	sendCommitted: send('COMMITTED'),
	sendEdited: send('EDITED')
};
