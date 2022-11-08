import clip from 'clipboardy';
import {stringify} from '@svizzle/utils';

import {stringifyObj} from '../../lib/utils/svizzle/obj-string.js';

import mapRouteStateNodes from '../../lib/machines/explorer/route.stateNodes.js';

clip.write(`Machine(${stringify(mapRouteStateNodes)}, ${stringifyObj({})})`);
console.log('/builder route copied to the clipboard\n');

// see https://xstate.js.org/viz/?gist=ecb30545fcdcecd8229b89c7e2f776fc
