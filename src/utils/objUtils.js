import _ from "lamb";

import {getLength, pairToKeyValueObject} from "./iterableUtils";
import {is0, isGT0} from "./numberUtils";

/* get */

export const getObjSize = _.pipe(_.keys, getLength);

/* check */

export const isObjEmpty = _.pipe(getObjSize, is0);
export const isObjNotEmpty = _.pipe(getObjSize, isGT0);

// // key -> fn
// const isKeyTrue = _.pipe(
//     _.apply(_.getKey),
//     _.is(true)
// );

/* edit */

export const makeFloatsValues = _.mapValuesWith(parseFloat);

/* transform: to array */

export const objectToKeyValueArray = _.pipe(
    _.pairs,
    _.mapWith(pairToKeyValueObject)
);

/* transform: to function */

export const applyFnMap = fnMap => obj => _.mapValues(fnMap, _.applyTo([obj]));

export const applyFnMap2 = fnMap => _.mapValuesWith(
    (value, key) => _.application(fnMap[key], [value])
);

// export const applyFnGroups = fnMap => _.mapValuesWith(
//     (value, key) => _.application(fnMap[key], [value])
// );
