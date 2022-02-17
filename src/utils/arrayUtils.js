import _ from "lamb";

import * as d3 from "@vendor/d3";

import {objectToKeyValueArray} from "./objUtils";

/* check */

// boolean elements

export const areAllTrue = _.every(_.identity);
export const areSomeTrue = _.some(_.identity);

/* edit (array -> array) */

export const toggleItem = (array, item) => {
    if (_.isIn(array, item)) {
        return _.pullFrom(array, [item]);
    } else {
        return _.appendTo(array, item);
    }
}

export const mapTo = (items, key) => _.map(items, _.getKey(key));

/* transform */

// array -> Number

export const arrayMaxBy = (items, key) => d3.max(items, _.getKey(key));

// array -> obj

// keys[] -> {key: 0, ...}
export const makeKeyedZeroes = _.pipe(
    _.collect(_.identity, _.mapWith(_.always(0))),
    _.apply(_.make)
);

// (items[], keys[]) => {key: Number}
export const makeOccurrences = (items, keys) =>
    _.reduce(items,
        (acc, item) => {
            _.forEach(keys, key => {
                if (_.getIn(item, key)) {
                    acc[key] += 1;
                }
            });

            return acc;
        },
        makeKeyedZeroes(keys)
    );

// (items[], keys[]) => {key, value}[]
export const makeOccurrencesKeyValueArray = _.pipe(
    makeOccurrences,
    objectToKeyValueArray
);

// array -> string

export const join = _.generic(Array.prototype.join);
export const joinWith = string => _.partial(join, [_, string]);

export const joinWithDash = joinWith("-");
export const joinWithColon = joinWith(":");
export const joinWithSemicolon = joinWith(";");
