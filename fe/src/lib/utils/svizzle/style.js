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

export const getSelectorText = _.getKey('selectorText');

export const makeGetStyleRulesObj = selectorRegex => _.pipe([
	_.filterWith(_.pipe([
		getSelectorText,
		makeTrimmedSplitBy(','),
		_.some(selectorRegex.test.bind(selectorRegex))
	])),
	_.mapWith(_.collect([
		getSelectorText,
		_.pipe([
			_.getPath('style.cssText'),
			parseCssText,
			_.fromPairs
		])
	])),
	/*
	v => {
		console.log('v', v);
		return v;
	},
	*/
	_.reduceWith(
		(themes, [selector, rules]) => {
			const themeEntry = _.find(
				themes,
				_.hasPathValue('0', selector)
			);
			if (themeEntry) {
				const [, existingRules] = themeEntry;
				themeEntry[1] = {...existingRules, ...rules};
			} else {
				themes.push([selector, rules]);
			}
			return themes;
		},
		[]
	),
	_.fromPairs
]);

export const getAllStylesBySelector = _.pipe([
	_.mapWith(_.collect([
		getSelectorText,
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
