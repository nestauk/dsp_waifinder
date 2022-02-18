import _ from "lamb";

import {is0, is1, isGT0, isGT1} from "./numberUtils";

export const getLength = _.getKey("length");

export const isIterableEmpty = _.pipe(getLength, is0);
export const isIterableNotEmpty = _.pipe(getLength, isGT0);
export const hasIterableLength1 = _.pipe(getLength, is1);
export const isIterableLongerThan1 = _.pipe(getLength, isGT1);

export const pairToKeyValueObject = ([key, value]) => ({key, value});
