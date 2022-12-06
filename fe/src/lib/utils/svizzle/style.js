import {
	joinWithBlank,
	makePostfixed,
	makePrefixed,
} from '@svizzle/utils';
import {rgb} from 'd3-color';
import * as _ from 'lamb';

export const getSelectorText = _.getKey('selectorText');

export const getAllStylesBySelector = _.pipe([
	_.mapWith(_.collect([
		getSelectorText,
		_.getKey('style')
	])),
	_.fromPairs
]);

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
