import {
	getValue,
	makeKeyedZeroes,
	objectToKeyValueArray,
} from '@svizzle/utils';
import * as _ from 'lamb';

export const getLonLat = _.collect([
	_.getPath('location.lon'),
	_.getPath('location.lat')
]);
export const getName = _.getKey('name');
export const getPlaceId = _.getKey('place_id');
export const getTopics = _.getKey('topics');
export const getTopicIds = _.getKey('topicIds');

export const getTopicLabel = _.replace(/_/ug, ' ');

export const getFirstPhrases = (text, startIndex = 0) => {
	const endIndex = text.indexOf('.', startIndex) + 1 || startIndex;
	return text.substring(0, endIndex);
}

export const countOrgTypes = ({orgs, orgTypes}) => {
	const orgCountByType = makeKeyedZeroes(orgTypes);

	_.forEach(orgs, ({types}) => {
		_.forEach(types, type => {
			orgCountByType[type] += 1;
		});
	});

	return orgCountByType;
};

export const getBoundingBox = (
	orgs,
	initial = [[180, 90], [-180, -90]]
) => _.reduce(
	orgs,
	([[w, s], [e, n]], {location: {lat, lon}}) => [
		[Math.min(w, lon), Math.min(s, lat)],
		[Math.max(e, lon), Math.max(n, lat)],
	],
	initial
);

// FIXME unused for now
export const objToKeyValueDesc = _.pipe([
	objectToKeyValueArray,
	_.sortWith([_.sorterDesc(getValue)]),
]);
