import {tapMessage} from '@svizzle/dev';
import {readJson, saveObj, saveObjPassthrough} from '@svizzle/file';
import {applyFnMap, getId, isIterableEmpty, transformValues} from '@svizzle/utils';
import * as _ from 'lamb';
import fetch from 'node-fetch';
import hash from 'object-hash';

import {getTopics} from '../lib/utils/dataUtils.js';
import {stripDbrPrefix} from '../lib/utils/dbpedia.js';

/* resources */

const ANNOTATED_ORGS_URL =
	'https://s3.eu-west-2.amazonaws.com/dap-uk-ai-map.public/ai_map_02.json';
const IN_FILE_DATA = '../ds/outputs/data/ai_map_orgs_places.json';
const OUT_FILE_DATA = 'static/data/ai_map_annotated_orgs.json';
const OUT_FILE_UNTAGGED_ORGS = 'dataQuality/orgsWithNoTopics.json';
const OUT_FILE_UNPLACED_ORGS = 'dataQuality/orgsWithNoPlace.json';
const OUT_FILE_ORGS_COUNTS_BY_URL_SCHEMA = 'dataQuality/orgsCountsByUrlSchema.json';

/* utils */

const makeGetRegionsByIdAtLevel = level => _.pipe([
	_.indexBy(_.getPath(`region.${level}.id`)),
	_.mapValuesWith(_.getPath(`region.${level}`))
]);
const getRegionsByLevelById = applyFnMap({
	1: makeGetRegionsByIdAtLevel(1),
	2: makeGetRegionsByIdAtLevel(2),
	3: makeGetRegionsByIdAtLevel(3),
});

// from @svizzle/utils@0.17.0 (not released yet)
// TODO upgrade @svizzle/utils
const sortObjectKeysAsc = _.pipe([
	_.pairs,
	_.sortWith([_.head]),
	_.fromPairs
]);

const filterTopics = _.pipe([
	_.partitionWith(({confidence}) => confidence >= 60),
	_.condition(
		_.pipe([_.head, isIterableEmpty]),
		_.pipe([
			_.last,
			_.groupBy(_.getKey('confidence')),
			_.pairs,
			_.sortWith([_.sorterDesc(_.head)]),
			_.getPath('0.1')
		]),
		_.head
	),
]);
const processTopics = _.pipe([
	filterTopics,
	_.mapWith(({confidence, URI}) => ({
		id: stripDbrPrefix(URI),
		score: confidence,
	})),
	_.sortWith([
		_.sorterDesc(_.getKey('score')),
		getId
	]),
]);

const schemaRegex = /^([a-z0-9]+):\/\//u;
const getSchema = url => (url.match(schemaRegex) || [])[1];
const condAddSchema = url => schemaRegex.test(url) ? url : `//${url}`;

const processOrg = _.pipe([
	_.skip(['dbpedia_entities_metadata']),
	_.rename({dbpedia_entities: 'topics'}),
	transformValues({
		topics: processTopics,
		types: _.sortWith(),
		url: condAddSchema
	}),
	obj => ({...obj, id: hash(obj)}),
	sortObjectKeysAsc,
]);

const processData = ({org_types, orgs, places}) => {
	const placesById = _.index(places, getId);
	const regionsByLevelById = getRegionsByLevelById(places);
	const processedOrgs = _.map(orgs, processOrg);

	return {
		org_types,
		orgs: processedOrgs,
		placesById,
		regionsByLevelById,
	}
}

/* data quality */

const getOrgsWithNoTopics = _.pipe([
	_.getKey('orgs'),
	_.filterWith(
		_.pipe([getTopics, isIterableEmpty])
	),
]);
const getOrgsWithNoPlace = ({orgs, placesById}) =>
	_.filter(orgs, ({place_id}) => !_.has(placesById, place_id));

const getOrgsCountsByUrlSchema = _.pipe([
	_.getKey('orgs'),
	_.countBy(_.pipe([
		_.getKey('url'),
		getSchema
	]))
]);

/* run */

const main = async () => {

	/* fetch annotated orgs */

	console.log(`Fetching ${ANNOTATED_ORGS_URL}...`);

	const orgs =
		await fetch(ANNOTATED_ORGS_URL)
		.then(res => res.json())
		.catch(err => console.error(err));

	/* process */

	const data =
		await readJson(IN_FILE_DATA)
		.then(obj => ({...obj, orgs}))
		.then(tapMessage('Processing...'))
		.then(processData)
		.then(saveObjPassthrough(OUT_FILE_DATA))
		.then(tapMessage(`Saved processed data in ${OUT_FILE_DATA}`))
		.catch(err => console.error(err));

	/* dq: topics */

	const orgsWithNoTopics = getOrgsWithNoTopics(data);

	saveObj(OUT_FILE_UNTAGGED_ORGS, 2)(orgsWithNoTopics)
	.then(tapMessage(`Saved objects with no topics in ${OUT_FILE_UNTAGGED_ORGS}`))
	.catch(err => console.error(err));

	/* dq: place */

	const orgsWithNoPlace = getOrgsWithNoPlace(data);

	saveObj(OUT_FILE_UNPLACED_ORGS, 2)(orgsWithNoPlace)
	.then(tapMessage(`Saved objects with no place in ${OUT_FILE_UNPLACED_ORGS}`))
	.catch(err => console.error(err));

	/* dq: url schema */

	const orgsCountsByUrlSchema = getOrgsCountsByUrlSchema(data);

	saveObj(OUT_FILE_ORGS_COUNTS_BY_URL_SCHEMA, 2)(orgsCountsByUrlSchema)
	.then(tapMessage(`Saved schema counts in ${OUT_FILE_ORGS_COUNTS_BY_URL_SCHEMA}`))
	.catch(err => console.error(err));
};

main();
