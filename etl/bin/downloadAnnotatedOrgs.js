import { promises as fs } from 'fs';

import { dump } from 'dap_dv_backends_utils/es/dump.mjs'

const DOMAIN = 'es.production.dap-tools.uk';
const INDEX = 'ai_map';

const documents = await dump(DOMAIN, INDEX, 10000);

await fs.writeFile(
	'data/outputs/ai_map_annotated.json',
	JSON.stringify(documents, null, 2)
);
