import {tapMessage} from '@svizzle/dev';
import {readJson, saveObj, saveObjPassthrough} from '@svizzle/file';
import {getId, isIterableEmpty, transformValues} from '@svizzle/utils';
import * as _ from 'lamb';
import fetch from 'node-fetch';
import hash from 'object-hash';

import {MIN_SCORE} from 'app/config';
import {getTopics} from 'app/utils/dataUtils';
import {stripDbrPrefix} from 'app/utils/dbpedia';

const ANNOTATED_ORGS_URL =
	'https://s3.eu-west-2.amazonaws.com/dap-uk-ai-map.public/ai_map.json';
const IN_FILE = '../ds/outputs/data/ai_map_orgs_places.json';
const OUT_FILE_DATA = 'static/data/ai_map_annotated_orgs.json';
const OUT_FILE_UNTAGGED_ORGS = 'dataQuality/orgsWithNoTopics.json';

const getRegionsById = _.pipe([
	_.indexBy(_.getKey('region_id')),
	_.mapValuesWith(_.pipe([
		_.rename({region_id: 'id', region_name: 'name'}),
		_.pick(['id', 'name']),
	])),
]);

// from @svizzle/utils@0.17.0 (not released yet)
// TODO upgrade @svizzle/utils
const sortObjectKeysAsc = _.pipe([
	_.pairs,
	_.sortWith([_.head]),
	_.fromPairs
]);

const processTopics = _.pipe([
	_.mapWith(({confidence, URI}) => ({
		id: stripDbrPrefix(URI),
		score: confidence,
	})),
	_.filterWith(({score}) => score >= MIN_SCORE),
	_.sortWith([
		_.sorterDesc(_.getKey('score')),
		getId
	]),
]);
const processOrg = _.pipe([
	_.skip(['dbpedia_entities_metadata']),
	_.rename({dbpedia_entities: 'topics'}),
	transformValues({topics: processTopics}),
	obj => ({...obj, id: hash(obj)}),
	sortObjectKeysAsc,
]);

const processData = ({org_types, orgs, places}) => {
	const placesById = _.index(places, getId);
	const regionsById = getRegionsById(places);
	const processedOrgs = _.map(orgs, processOrg);

	return {
		org_types,
		orgs: processedOrgs,
		placesById,
		regionsById,
	}
}

const getOrgsWithNoTopics = _.pipe([
	_.getKey('orgs'),
	_.filterWith(
		_.pipe([getTopics, isIterableEmpty])
	),
	orgs => ({minScore: MIN_SCORE, orgs})
]);

const main = async () => {

	/* fetch annotated orgs */

	console.log(`Fetching ${ANNOTATED_ORGS_URL}...`);

	const orgs =
		await fetch(ANNOTATED_ORGS_URL)
		.then(res => res.json())
		.catch(err => console.error(err));

	/* process & save */

	await readJson(IN_FILE)
	.then(obj => ({...obj, orgs}))
	.then(tapMessage('Processing...'))
	.then(processData)
	.then(saveObjPassthrough(OUT_FILE_DATA))
	.then(tapMessage(`Saved processed data in ${OUT_FILE_DATA}`))
	.then(getOrgsWithNoTopics)
	.then(saveObj(OUT_FILE_UNTAGGED_ORGS, 2))
	.then(tapMessage(`Saved objects with no topics in ${OUT_FILE_UNTAGGED_ORGS}`))
	.catch(err => console.error(err));
};

main();
