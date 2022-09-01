import {makeToGeoPoints} from '@svizzle/geo';
import {
	getId,
	getLength,
	getKey,
	getValue,
	isNotNil,
	objectToKeyValueArray,
	sortValueDescKeyAsc,
} from '@svizzle/utils';
import isEqual from 'just-compare';
import * as _ from 'lamb';
import Supercluster from 'supercluster';
import {derived, get} from 'svelte/store';

import {_dataset} from '$lib/stores/dataset';
import {
	_bbox_WSEN,
	_isOrgWithinBbox,
	_orgSearchRegex,
	_orgTypesSelectionMode,
	_placesSearchRegex,
	_selectedOrgTypes,
	_zoom,
} from '$lib/stores/selection';
import {countOrgTypes, getLonLat, getTopics} from '$lib/utils/dataUtils';
import {isRegexpNotEmpty} from '$lib/utils/svizzle/utils';

/* filtered orgs */

/* [1] FIXME using:

```
const isSelectedType = makeIsIncluded(selectedTypes);
```

fails to select `University of Oxford` (which is a funder & a university),
if we select 'University / RTO' only

NOTE that this would work:

```
isSelectedType = _.pipe([tapValue(), makeIsIncluded(selectedTypes)])
```
*/
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

export const _allOrgs = derived(
	[
		_dataset,
		_orgSearchRegex,
		_orgTypesSelectionMode,
		_placesSearchRegex,
		_selectedOrgTypes,
	],
	([
		{orgs},
		orgSearchRegex,
		orgTypesSelectionMode,
		placesSearchRegex,
		selectedOrgTypes,
	]) => {
		const predicates = [
			makeIsOrgOfTypes(selectedOrgTypes, orgTypesSelectionMode)
		];

		if (isRegexpNotEmpty(orgSearchRegex)) {
			predicates.push(makeIsTextInOrg(orgSearchRegex))
		}
		if (isRegexpNotEmpty(placesSearchRegex)) {
			predicates.push(makeIsOrgInPlace(placesSearchRegex))
		}

		return _.filter(orgs, _.allOf(predicates));
	});

export const _orgs = derived(
	[_allOrgs, _isOrgWithinBbox],
	([allOrgs, isOrgWithinBbox]) => _.filter(allOrgs, isOrgWithinBbox)
);

/* org count */

export const _orgsCount = derived(_orgs, getLength);

/* clustering */

const toGeoPoints = makeToGeoPoints(getLonLat);

export const _clustersTree = derived(
	_allOrgs,
	allOrgs => {
		const tree = new Supercluster({
			maxZoom: 14,
			minPoints: 6
		});
		const {features} = toGeoPoints(allOrgs);

		tree.load(features);

		return tree;
	}
);

export const _clusters = derived(
	[_bbox_WSEN, _clustersTree, _zoom],
	([bbox_WSEN, clustersTree, zoom]) =>
		clustersTree.getClusters(bbox_WSEN, zoom)
);

// clustering utils

export const getClusterLeaves =
	clusterId => get(_clustersTree).getLeaves(clusterId, Infinity);

export const getClusterExpansionZoom =
	clusterId => get(_clustersTree).getClusterExpansionZoom(clusterId);

/* barchart of org types */

export const _keyOrgTypeValueOrgsCount = derived(
	[_orgs, _dataset],
	([orgs, {orgTypes}]) => {
		const orgTypesCount = countOrgTypes({orgs, orgTypes});
		const keyValueArray = objectToKeyValueArray(orgTypesCount);

		return keyValueArray;
	}
);

/* barchart of topics */

export const _keyTopicIdValueOrgsCount = derived(
	_orgs,
	_.pipe([
		_.flatMapWith(getTopics),
		_.countBy(getId),
		objectToKeyValueArray,
		_.sortWith([
			_.sorterDesc(getValue),
			getKey
		]),
		_.take(100)
	])
);

/* barchart of places */

const makeKeyPlaceIdValueOrgsCount = _.pipe([
	_.countBy(_.getKey('place_id')),
	objectToKeyValueArray,
]);
export const _keyPlaceLabelValueOrgsCount = derived(
	[_orgs, _dataset],
	([orgs, {placesById}]) => sortValueDescKeyAsc(
		_.map(
			makeKeyPlaceIdValueOrgsCount(orgs),
			({key, value}) => ({
				key: placesById[key].name,
				value
			})
		)
	)
);

/* barchart by region */

const makeKeyRegionIdValueOrgsCount = _.pipe([
	_.countBy(_.getPath('place.region.3.id')),
	objectToKeyValueArray,
]);
export const _keyRegionLabelValueOrgsCount = derived(
	[_orgs, _dataset],
	([orgs, {regionsByLevelById}]) => sortValueDescKeyAsc(
		_.map(
			makeKeyRegionIdValueOrgsCount(orgs),
			({key, value}) => ({
				key: `${regionsByLevelById[3][key].name} (${key})`,
				value
			})
		)
	)
);