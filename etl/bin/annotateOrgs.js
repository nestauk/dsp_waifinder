import { fetch } from 'undici'

const { NESTA_EMAIL, NESTA_TOKEN } = process.env;

if (!NESTA_EMAIL || !NESTA_TOKEN) {
	throw new Error(`
		Please export your NESTA_EMAIL and NESTA_TOKEN as environment variables.
		More information on how to retrieve these can be found here:
		https://github.com/nestauk/dap_dv_backends/tree/dev/src/services/authentication`
	)
}

const authHeader = `Basic ${Buffer.from(NESTA_EMAIL + ':' + NESTA_TOKEN).toString('base64')}`;

const query = {
	domain: 'es.production.dap-tools.uk',
	index: 'ai_map',
	field: 'description',
	workers: 1
}

const queryString = new URLSearchParams(query);
const url = `https://api.dap-tools.uk/annotate/es?${queryString.toString()}`;

let options = {
	method: 'GET',
	headers: {
		Authorization: authHeader
	}
};

const response = await fetch(url, options);
const result = await response.json();

console.log(result);
