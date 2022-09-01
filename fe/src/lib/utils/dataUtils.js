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
export const getURL = _.getKey('url');
export const getTopics = _.getKey('topics');

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
}

// FIXME unused for now
export const objToKeyValueDesc = _.pipe([
	objectToKeyValueArray,
	_.sortWith([_.sorterDesc(getValue)]),
]);