import {makeToGeoPoints} from '@svizzle/geo';
import {
	getKey,
	getLength,
	getValue,
	isIterableNotEmpty,
	isNotNil,
	objectToKeyValueArray,
	sortValueDescKeyAsc,
} from '@svizzle/utils';
import isEqual from 'just-compare';
import * as _ from 'lamb';
import Supercluster from 'supercluster';
import {derived, get} from 'svelte/store';

import {DEFAULT_BBOX_WS_EN, nutsLevel} from '$lib/config';
import {_dataset} from '$lib/stores/dataset';
import {_autoZoom} from '$lib/stores/interaction';
import {
	_bbox_WSEN,
	_isOrgWithinBbox,
	_isPlacesEditMode,
	_isRegionsEditMode,
	_isTopicsEditMode,
	_orgSearchRegex,
	_orgTypesSelectionMode,
	_placesSearchRegex,
	_selectedOrgTypes,
	_selectedPlaceIds,
	_selectedRegionIds,
	_selectedTopicIds,
	_zoom
} from '$lib/stores/selection';
import {
	countOrgTypes,
	getBoundingBox,
	getLonLat,
	getName,
	getPlaceId,
	getTopicIds,
} from '$lib/utils/dataUtils';
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
		_isPlacesEditMode,
		_isRegionsEditMode,
		_isTopicsEditMode,
		_orgSearchRegex,
		_orgTypesSelectionMode,
		_placesSearchRegex,
		_selectedOrgTypes,
		_selectedPlaceIds,
		_selectedRegionIds,
		_selectedTopicIds,
	],
	([
		{orgs},
		isPlacesEditMode,
		isRegionsEditMode,
		isTopicsEditMode,
		orgSearchRegex,
		orgTypesSelectionMode,
		placesSearchRegex,
		selectedOrgTypes,
		selectedPlaceIds,
		selectedRegionIds,
		selectedTopicIds,
	]) => {
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

		return _.filter(orgs, _.allOf(predicates));
	});

export const _allOrgsBBox = derived(
	[_allOrgs, _autoZoom],
	([allOrgs, autoZoom]) => autoZoom
		? allOrgs.length > 0
			? getBoundingBox(allOrgs)
			: DEFAULT_BBOX_WS_EN
		: null
);

export const _orgs = derived(
	[_allOrgs, _isOrgWithinBbox],
	([allOrgs, isOrgWithinBbox]) => _.filter(allOrgs, isOrgWithinBbox)
);

/* org count */

export const _orgsCount = derived(_orgs, getLength);

/* org chars */

const getOrgNameFirstChar = _.pipe([
	getName,
	_.head,
	_.invoke('toUpperCase'),
	char => (/[A-Z]/ug).test(char) ? char : '#'
]);

export const _orgsChar = derived(_orgs,_.pipe([
	_.mapWith(getOrgNameFirstChar),
	_.uniques
]));

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
		_.flatMapWith(getTopicIds),
		_.countBy(_.identity),
		// TODO ^ use a reduce
		objectToKeyValueArray,
		_.sortWith([
			_.sorterDesc(getValue),
			getKey
		]),
		_.take(100)
	])
);

/* places */

// selected

export const _selectedPlaces = derived(
	[_dataset, _selectedPlaceIds],
	([{placesById}, selectedPlaceIds]) => _.map(
		selectedPlaceIds,
		id => placesById[id]
	)
);

// barchart of places

export const _keyPlaceIdValueOrgsCount = derived(
	_orgs,
	_.pipe([
		_.countBy(getPlaceId),
		objectToKeyValueArray,
		sortValueDescKeyAsc,
	])
);

/* regions */

// selected

export const _selectedRegions = derived(
	[_dataset, _selectedRegionIds],
	([{regionsByLevelById}, selectedRegionIds]) => _.map(
		selectedRegionIds,
		id => regionsByLevelById[nutsLevel][id]
	)
);

// barchart by region

export const _keyRegionIdValueOrgsCount = derived(
	_orgs,
	_.pipe([
		_.countBy(_.getPath(`place.region.${nutsLevel}.id`)),
		objectToKeyValueArray,
		sortValueDescKeyAsc,
	])
);
