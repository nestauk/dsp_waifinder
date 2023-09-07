import { promises as fs } from 'fs';

import * as _ from 'lamb';


// const FILE_SOURCE = '../ds/outputs/data/ai_map_orgs_places_refreshed_part_2.json';
const FILE_SOURCE = '../ds/outputs/data/ai_map_orgs_places_refreshed_part_2.json';
const FE_FILE_SOURCE = '../fe/static/data/ai_map_annotated_orgs.json'


const checkDsOutput = async () => {
	const data = JSON.parse(await fs.readFile(FILE_SOURCE));
	const orgPlaceIds = _.map(data.orgs, org => org.place_id);
    const placeIds = _.map(data.places, place => place.id);

    const hasAllNames = _.everyIn(
        data.places,
        place => 'name' in place
    )
    console.log('hasAllNames: ', hasAllNames)

    const safe = _.everyIn(orgPlaceIds, id => placeIds.includes(id));
    console.log(safe);
}

const checkFeStaticData = async () => {
    const data = JSON.parse(await fs.readFile(FE_FILE_SOURCE));
	const orgPlaceIds = _.map(data.orgs, org => org.place_id);
    const placeIds = _.keys(data.placesById);

    const safe = _.everyIn(orgPlaceIds, id => placeIds.includes(id));
    console.log(safe); 
}
const main = async () => {
    await checkDsOutput();
    await checkFeStaticData();
};

main();
