import { fetch } from 'undici'

import { sleep } from 'dap_dv_backends_utils/util/time.mjs';

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

let response = await fetch(url, options);
const { id } = await response.json();

console.log(id);

const progressEndpoint = 'https://api.dap-tools.uk/annotate/progress/'
response = await fetch(`${progressEndpoint}/${id}`)
let progress = await response.json();

while (progress.status !== 'finished') {
	response = await fetch(`${progressEndpoint}/${id}`)
	progress = await response.json();
	console.log(progress);

	await sleep(1000 * 10);
}

