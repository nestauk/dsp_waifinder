import fs from 'fs';
import * as _ from 'lamb';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import Queue from 'queue-promise';

import {lighthouseUrls, urlBases} from '../../src/lib/config.js';

const queue = new Queue({
	concurrent: 1
});

queue.on('end', () => {
	console.log('Done!');
});

const auditURL = async (id, url) => {
	console.log('Launching chrome...')
	try {
		const chrome = await chromeLauncher.launch({
			port: 9222,
			chromeFlags: [
				'--headless',
				// uncomment below if there are problems running the tests
				// '--no-sandbox',
			]
		});
		console.log('Launched chrome succesfully.')
		const options = {
			logLevel: 'info',
			output: 'html',
			formFactor: 'desktop',
			screenEmulation: {
				disabled: true
			},
			// for performance results to be meaningful
			// a reliable testing environment must be configured
			onlyCategories: [
				'accessibility',
				'best-practices',
				// 'performance',
				'seo'
			],
			port: chrome.port
		};
		const runnerResult = await lighthouse(
			urlBases.development + url,
			options
		);
		const reportHtml = runnerResult.report.replaceAll(urlBases.development, urlBases.production);

		// eslint-disable-next-line no-sync
		fs.writeFileSync(`static/audits/lighthouse/${id}.html`, reportHtml);

		// `.lhr` is the Lighthouse Result as a JS object
		console.log(
			'Report is done for',
			runnerResult.lhr.finalUrl
		);
		console.log(
			'Accessibility score was',
			runnerResult.lhr.categories.accessibility.score * 100
		);
	} catch (e) {
		console.error('Error!', e);
	} finally {
		await chrome.kill();
		console.log('Killed chrome.');
	}
}

const enqueueTask = ([id, url]) =>
	queue.enqueue(() => auditURL(id, url));

const auditUrls = _.pipe([
	_.pairs,
	_.mapWith(enqueueTask)
]);

auditUrls(lighthouseUrls);
