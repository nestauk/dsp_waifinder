import * as _ from 'lamb';
import {capitalize} from '@svizzle/utils';
import fetch from 'node-fetch';

import {minVersions} from './options.mjs';

// import {environments} from './environments.mjs';

const username = process.env.BROWSERSTACK_USERNAME;
const key = process.env.BROWSERSTACK_ACCESS_KEY;
const browsersUrl = 'api.browserstack.com/5/browsers?flat=true';
async function getBrowsers () {
	const response = await fetch(`https://${username}:${key}@${browsersUrl}`);
	return response.json();
}

const getOS = _.getPath('os');
const getBrowser = _.getPath('browser');
const getBrowserVersion = _.getPath('browser_version');

const getOsBrowser = c => getOS(c) + '_' + getBrowser(c);

const isNotWinphone = _.pipe([
	getOS,
	_.not(_.is('winphone'))
]);

const isNewerVersionThan = minVersions => caps => {
	if (caps.device) {
		return true;
	}
	const minV = parseFloat(minVersions[capitalize(caps.browser)]);
	const currV = parseFloat(getBrowserVersion(caps));
	return minV < currV;
};

export const groupBrowsers = _.pipe([
	_.filterWith(_.pipe([
		getOS,
		_.not(_.is('winphone'))
	])),
	_.groupBy(getOS),
	_.mapValuesWith(_.pipe([
		_.groupBy(getBrowser),
		_.mapValuesWith(_.getKey('length')),
	]))
]);

export const filterAndGroupBrowsers = _.pipe([
	_.filterWith(isNotWinphone),
	_.filterWith(isNewerVersionThan(minVersions)),
	_.groupBy(getOS),
	_.mapValuesWith(_.pipe([
		_.groupBy(getBrowser),
		_.mapValuesWith(_.getKey('length')),
	])),
	_.pairs
]);

export const filterAndGroupBrowsers2 = _.pipe([
	_.filterWith(isNotWinphone),
	_.filterWith(isNewerVersionThan(minVersions)),
	_.groupBy(getOsBrowser),
	_.mapValuesWith(_.getKey('length')),
	_.pairs
]);

async function runAll() {
	const devicesCaps = await getBrowsers();
	const s4caps = devicesCaps;
	const groups = filterAndGroupBrowsers2(s4caps);
	console.log((groups))
}

runAll();
