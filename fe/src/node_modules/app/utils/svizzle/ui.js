import {getTruthyValuesKeys} from '@svizzle/utils';
import * as _ from 'lamb';

export const getOrientation = _.pipe([
	getTruthyValuesKeys,
	_.pairs,
	_.getPath('0.1')
]);

const makeGetFirstTrueValueOf = keyBoolObj => _.pipe([
	_.mapWith(key => [key, keyBoolObj[key]]),
	_.filterWith(([, value]) => value),
	_.getPath('0.0')
]);

export const getScreenType = sizes => {
	if (sizes.xSmall) {
		return 'xSmall';
	}

	const getType = makeGetFirstTrueValueOf(sizes);
	const orderedSizes = ['xLarge', 'large', 'medium', 'small'];

	return getType(orderedSizes);
};
