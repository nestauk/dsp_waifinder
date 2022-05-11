import {tapMessage} from '@svizzle/dev';
import {readJson, saveObj} from '@svizzle/file';
import {getId, transformValues} from '@svizzle/utils';
import * as _ from 'lamb';
import fetch from 'node-fetch';
import hash from 'object-hash';

const SOURCE_URL =
	'https://s3.eu-west-2.amazonaws.com/dap-uk-ai-map.public/ai_map.json';
const IN_FILE = '../ds/outputs/data/ai_map_orgs_places.json';
const OUT_FILE = 'static/data/ai_map_annotated_orgs.json';

// from @svizzle/utils@0.17.0 (not released yet)
// TODO upgrade @svizzle/utils
const sortObjectKeysAsc = _.pipe([
	_.pairs,
	_.sortWith([_.getAt(0)]),
	_.fromPairs
]);

const stripBase = _.replace('http://dbpedia.org/resource/', '');
const transformEntity = ({confidence, URI}) => ({
	id: stripBase(URI),
	score: confidence,
});
const transformOrg = _.pipe([
	_.skip(['dbpedia_entities_metadata']),
	_.rename({dbpedia_entities: 'topics'}),
	transformValues({
		topics: _.pipe([
			_.mapWith(transformEntity),
			_.sortWith([
				_.sorterDesc(_.getKey('score')),
				getId
			])
		])
	}),
	obj => ({...obj, id: hash(obj)}),
	sortObjectKeysAsc
]);

const transformOrgs = _.pipe([
	_.mapWith(transformOrg),
	_.sortWith([
		_.sorterDesc(_.getPath('topics.0.score')),
		_.getKey('name')
	])
]);

const main = async () => {
	console.log(`Fetching ${SOURCE_URL}...`);

	const orgs =
		await fetch(SOURCE_URL)
		.then(res => res.json())
		.then(tapMessage('Transforming...'))
		.then(transformOrgs)
		.catch(err => console.error(err));

	console.log('Saving...');

	await readJson(IN_FILE)
	.then(obj => ({...obj, orgs}))
	.then(saveObj(OUT_FILE))
	.then(tapMessage(`Saved output in ${OUT_FILE}`))
	.catch(err => console.error(err));
};

main();
