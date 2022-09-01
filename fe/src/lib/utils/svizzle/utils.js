import {trim} from '@svizzle/utils';
import rescape from 'escape-string-regexp';
import * as _ from 'lamb';

/* String -> Regex */

export const makeRegexOf = flags =>
	string => new RegExp(string, flags);

export const makeSafeRegexOf = flags =>
	string => new RegExp(rescape(string), flags);

export const safeRegexOf = string => makeSafeRegexOf('giu')(string);
export const regexOf = string => makeRegexOf('giu')(string);

/* String -> Array */

export const makeTrimmedSplitBy = separator => _.pipe([
	_.splitBy(separator),
	_.mapWith(trim)
]);

/* String -> String */

export const toLowerCase = str => str.toLowerCase();

/* Regexp -> Boolean */

export const isRegexpEmpty = regexp => regexp.source === '(?:)';
export const isRegexpNotEmpty = regexp => regexp.source !== '(?:)';
