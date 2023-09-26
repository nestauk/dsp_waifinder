import { promises as fs } from 'fs';

import { fetch } from 'undici'

import { Presets, SingleBar } from 'cli-progress';
import * as _ from 'lamb';

const KEY = process.env.GOOGLE_API_KEY;
if (!KEY) {
	throw new Error('GOOGLE_API_KEY is not set.');
}

const FILE_SOURCE = 'data/outputs/ai_map_orgs_places_populated.json';
const FILE_SUBSET = 'data/outputs/ai_map_orgs_places_locations_populated_subset.json';
const FILE_POPULATED = 'data/outputs/ai_map_orgs_places_locations_populated.json';
const FILE_NO_RESULTS = 'data/outputs/ai_map_orgs_places_locations_not_found.json';


const endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

const query = {
	key: KEY,
	region: 'uk'
}

// taken from https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/488478/Bulk_Data_Transfer_-_additional_validation_valid_from_12_November_2015.pdf
const postCodeRegex = /([A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/gm

const search = async queryTerm => {
	const queryString = new URLSearchParams({
		...query,
		query: queryTerm
	});
	const url = `${endpoint}?${queryString.toString()}`;
	const response = await fetch(url);
	const result = await response.json();

	return result;
}

const main = async () => {

	const data = JSON.parse(await fs.readFile(FILE_SOURCE));
	const [filled, missing] = _.partition(data.orgs, org => org.location.lat);

	const found = [];
	const noResults = [];

	const bar = new SingleBar(Presets.rect);
	bar.start(missing.length, 0);

	// loop needed to avoid rate limiting issues
	for (const org of missing) {

		bar.increment();

		// eslint-disable-next-line no-await-in-loop
		const searchResults = await search(org.name);
		if (searchResults.status === 'ZERO_RESULTS') {
			noResults.push(org);
			continue;
		}
		const UKResults = _.filter(
			searchResults.results,
			result => postCodeRegex.test(result.formatted_address)
		)
		if (UKResults.length === 0) {
			noResults.push(org);
			continue;
		}
		const [topResult] = UKResults;
		const [postcode] = topResult.formatted_address.match(postCodeRegex)
		found.push({
			...org,
			location: {
				lat: topResult.geometry.location.lat,
				lon: topResult.geometry.location.lng,
				postcode
			}
		});
	}
	bar.stop();
	const filledData = {
		...data,
		orgs: [...filled, ...found]
	};
	await fs.writeFile(FILE_SUBSET, JSON.stringify(found, null, 4));
	await fs.writeFile(FILE_POPULATED, JSON.stringify(filledData, null, 4));
	await fs.writeFile(FILE_NO_RESULTS, JSON.stringify(noResults, null, 4));

	console.log(`Found location for ${found.length} orgs.`);
	console.log(`Failed to find location for ${noResults.length} orgs.`);
};

main();