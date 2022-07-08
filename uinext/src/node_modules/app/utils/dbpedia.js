import * as _ from 'lamb';
import {getValue} from '@svizzle/utils';

export const dbrPrefix = 'http://dbpedia.org/resource/';
const wikipediaPrefix = 'https://en.wikipedia.org/wiki/';

export const stripDbrPrefix = _.replace(dbrPrefix, '');

export const getWikipediaURL = id => wikipediaPrefix + id;

// Code extracted from https://github.com/nestauk/dap_dv_backends/pull/105
const query = async (
	sparql,
	endpoint='https://dbpedia.org/sparql',
	{ responseFormat='application/json' } = {}
) => {
	const headers = {
		Accept: responseFormat,
		'Content-Type': 'application/sparql-query'
	};
	const response = await fetch(endpoint,
		{
			method: 'POST',
			body: sparql,
			headers
		}
	);
	if (responseFormat === 'application/json') {
		return response.json();
	}
	return response;
};

export const fetchEntityDetail = async topicId => {
	const URI = `<${dbrPrefix}${topicId}>`;

	const sparql = `
		PREFIX dbo: <http://dbpedia.org/ontology/>
		PREFIX dbr: <http://dbpedia.org/resource/>
		PREFIX prov: <http://www.w3.org/ns/prov#>
		SELECT * WHERE {
			BIND (${URI} as ?uri)
			OPTIONAL {
				${URI} dbo:abstract ?abstract .
				FILTER (langMatches(lang(?abstract),"en"))
			}
			OPTIONAL { ${URI} dbo:thumbnail ?thumbnailURL . }
		}`;

	const {results} = await query(sparql);
	const [binding] = results.bindings;
	const value = _.mapValues(binding, getValue);

	return value;
};
