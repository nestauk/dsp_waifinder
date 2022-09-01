import {
	isIterableNotEmpty,
	joinWithBlank,
	makePostfixed,
	makePrefixed,
} from '@svizzle/utils';
import {rgb} from 'd3-color';
import * as _ from 'lamb';

import {makeTrimmedSplitBy} from './utils';

const parseCssText = _.pipe([
	_.splitBy(';'),
	_.filterWith(isIterableNotEmpty),
	_.mapWith(makeTrimmedSplitBy(':'))
]);

export const getStylesheet = href => _.find(
	[...document.styleSheets], // convert collection to array
	_.hasKeyValue('href', href)
);

export const makeGetStyleRulesObj = selectorRegex => _.pipe([
	_.filterWith(_.pipe([
		_.getKey('selectorText'),
		makeTrimmedSplitBy(','),
		_.some(selectorRegex.test.bind(selectorRegex))
	])),
	_.mapWith(_.collect([
		_.getKey('selectorText'),
		_.pipe([
			_.getPath('style.cssText'),
			parseCssText,
			_.fromPairs
		])
	])),
	_.fromPairs
]);

export const getAllStylesBySelector = _.pipe([
	_.mapWith(_.collect([
		_.getKey('selectorText'),
		_.getKey('style')
	])),
	_.fromPairs
]);

export const setStyleRules = (targetRules, srcRules) => {
	const selectors = _.keys(srcRules);
	selectors.forEach(selector => {
		if (selector in targetRules) {
			const style = srcRules[selector];
			const properties = _.keys(style);
			properties.forEach(prop => {
				targetRules[selector].setProperty(prop, style[prop])
			});
		}
	})
}

export const getHexColor = _.pipe([rgb, _.invoke('formatHex')]);

const getPropDef = _.pipe([
	_.joinWith(': '),
	makePostfixed(';\n')
]);
const getRuleDefs = _.pipe([
	_.pairs,
	_.mapWith(getPropDef),
	_.joinWith('\t'),
	makePrefixed('{\n\t'),
	makePostfixed('}')
]);
const getClassDef = _.pipe([
	_.collect([
		_.getAt(0),
		_.pipe([
			_.getAt(1),
			getRuleDefs
		])
	]),
	joinWithBlank
]);
export const getThemeClassDefsText = _.pipe([
	_.pairs,
	_.mapWith(getClassDef),
	_.joinWith('\n'),
]);
