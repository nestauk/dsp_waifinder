import {
	capitalize,
	getId,
	isIterableNotEmpty,
	makePostfixed,
	stringify,
} from '@svizzle/utils';
import {csvFormat} from 'd3-dsv';
import {saveAs} from 'file-saver';
import JSZip from 'jszip';
import * as _ from 'lamb';
import {get} from 'svelte/store';

import {toolName} from '$lib/config.js';
import {_orgs} from '$lib/stores/data';
import {
	_bbox_WSEN,
	_orgSearchValue,
	_orgTypesSelectionMode,
	_placesSearchValue,
	_selectedOrgTypes,
} from '$lib/stores/selection';
import sanitizeFilepath from '$lib/utils/adapted/node-sanitize-filename/index.js';
import {version} from '$lib/utils/version.js';

/* results metadata */

const dotsToBang = str => str.replace(/\./gu, '_');
const coordToStr = n => dotsToBang(n.toFixed(5));
const illegalCharsToSpace = str => str.replace(/[\s/]/gu, ' ');
const sanitiseType = _.pipe([
	illegalCharsToSpace,
	_.splitBy(/\s+/gu),
	_.mapWith(capitalize),
	_.joinWith('')
]);
const whitespaceToPlus = str => str.replace(/\s+/gu, '+');
const sanitiseSearchText = _.pipe([illegalCharsToSpace, whitespaceToPlus]);
const buildFilename = _.pipe([
	_.filterWith(isIterableNotEmpty),
	_.joinWith('_'),
	sanitizeFilepath,
	makePostfixed('.zip')
]);

export const getResultsMetadata = () => {
	const bbox_WSEN = get(_bbox_WSEN);
	const orgSearchValue = get(_orgSearchValue);
	const orgTypesSelectionMode = get(_orgTypesSelectionMode);
	const placesSearchValue = get(_placesSearchValue);
	const selectedOrgTypes = get(_selectedOrgTypes);

	// filename

	const filenameParts = [
		toolName,
		dotsToBang(version),
		...selectedOrgTypes.map(sanitiseType),
		orgTypesSelectionMode,
		sanitiseSearchText(orgSearchValue),
		sanitiseSearchText(placesSearchValue),
		...bbox_WSEN.map(coordToStr),
	];
	const filename = buildFilename(filenameParts);

	// filters

	const filters = {
		boundingBox: bbox_WSEN,
		selectedOrgTypes,
		selectedOrgTypesMode: orgTypesSelectionMode,
		textSearch: orgSearchValue,
		placeSearch: placesSearchValue,
		version,
	};
	const filtersString = stringify(filters);

	return {filename, filtersString};
}

/* results csv */

export const getResultsCsv = () => {
	const orgs = get(_orgs);

	const output = orgs.map(org => ({
		name: org.name,
		name_extra: org.name_extra,
		url: org.url,
		types: org.types,
		id: org.id,
		topics: org.topics.map(getId),
		lat: org.location.lat,
		lon: org.location.lon,
		postcode: org.location.postcode,
		placeLat: org.place.centroid.lat,
		placeLon: org.place.centroid.lon,
		placeName: org.place.name,
		placeType: org.place.type,
		regionIdNUTS1: org.place.region[1].id,
		regionNameNUTS1: org.place.region[1].name,
		regionIdNUTS2: org.place.region[2].id,
		regionNameNUTS2: org.place.region[2].name,
		regionIdNUTS3: org.place.region[3].id,
		regionNameNUTS3: org.place.region[3].name,
	}));

	return csvFormat(output);
}

/* zip */

export const getZippedFiles = async files => {
	const zipper = new JSZip();

	_.pairs(files)
	.forEach(([name, content]) => zipper.file(name, content));

	const zipBlob = await zipper.generateAsync({type: 'blob'});

	return zipBlob;
}

export const initiateZippedDownload = async (zipName, files) => {
	const content = await getZippedFiles(files);
	saveAs(content, zipName);
}
