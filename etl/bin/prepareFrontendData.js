import {tapMessage} from '@svizzle/dev';
import {readJson, saveObj, saveObjPassthrough} from '@svizzle/file';
import {
	applyFnMap,
	getId,
	isIterableEmpty,
	makeMergeAppliedFnMap,
	sortObjectKeysAsc,
	transformValues,
} from '@svizzle/utils';
import {clearScroll, scroll} from 'dap_dv_backends_utils/es/search.mjs'
import * as _ from 'lamb';
import {mkdirp} from 'mkdirp'
import hash from 'object-hash';

import {getTopics} from '../../fe/src/lib/utils/dataUtils.js';
import {stripDbrPrefix} from '../../fe/src/lib/utils/dbpedia.js';

/* resources */

const DOMAIN = 'es.production.dap-tools.uk';
const INDEX = 'ai_map';
const IN_FILE_DATA = '../ds/outputs/data/ai_map_orgs_places.json';
const OUT_FILE_DATA = '../fe/static/data/ai_map_annotated_orgs.json';
const OUT_FILE_UNTAGGED_ORGS = 'data/quality/fe/orgsWithNoTopics.json';
const OUT_FILE_UNPLACED_ORGS = 'data/quality/fe/orgsWithNoPlace.json';
const OUT_FILE_UNLINKED_ORGS = 'data/quality/fe/orgsWithNoURL.json';
const OUT_FILE_ORGS_COUNTS_BY_URL_SCHEMA = 'data/quality/fe/orgsCountsByUrlSchema.json';

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
	makeMergeAppliedFnMap({
		topicIds: _.pipe([getTopics, _.pluck('id')])
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
const getOrgsWithNoURL = _.pipe([
	_.getKey('orgs'),
	_.filterWith(_.not(_.hasKey('url'))),
]);
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

	await mkdirp('../fe/static/data');
	await mkdirp('data/quality/fe');

	console.log(`Fetching docs from ${DOMAIN}/${INDEX}...`);
	const scroller = scroll(DOMAIN, INDEX);
	let orgs = [];
	let page;
	for await (page of scroller) {
		orgs.push(...(_.map(page.hits.hits, _.getKey('_source'))));
	}
	if (page) {
		clearScroll(DOMAIN, page._scroll_id);
	}

	/* process */
	const data =
		await readJson(IN_FILE_DATA)
		.then(obj => ({...obj, orgs}))
		.then(tapMessage('Processing...'))
		.then(processData)
		.then(saveObjPassthrough(OUT_FILE_DATA))
		.then(tapMessage(`Saved processed data in ${OUT_FILE_DATA}`))
		.catch(err => console.error(err));

	/* dq: no topics */

	const orgsWithNoTopics = getOrgsWithNoTopics(data);

	saveObj(OUT_FILE_UNTAGGED_ORGS, 2)(orgsWithNoTopics)
	.then(tapMessage(`Saved objects with no topics in ${OUT_FILE_UNTAGGED_ORGS}`))
	.catch(err => console.error(err));

	/* dq: no place */

	const orgsWithNoPlace = getOrgsWithNoPlace(data);

	saveObj(OUT_FILE_UNPLACED_ORGS, 2)(orgsWithNoPlace)
	.then(tapMessage(`Saved objects with no place in ${OUT_FILE_UNPLACED_ORGS}`))
	.catch(err => console.error(err));

	/* dq: no URL */

	const orgsWithNoURL = getOrgsWithNoURL(data);

	saveObj(OUT_FILE_UNLINKED_ORGS, 2)(orgsWithNoURL)
	.then(tapMessage(`Saved objects with no URL in ${OUT_FILE_UNLINKED_ORGS}`))
	.catch(err => console.error(err));

	/* dq: url schema */

	const orgsCountsByUrlSchema = getOrgsCountsByUrlSchema(data);

	saveObj(OUT_FILE_ORGS_COUNTS_BY_URL_SCHEMA, 2)(orgsCountsByUrlSchema)
	.then(tapMessage(`Saved schema counts in ${OUT_FILE_ORGS_COUNTS_BY_URL_SCHEMA}`))
	.catch(err => console.error(err));
};

main();
