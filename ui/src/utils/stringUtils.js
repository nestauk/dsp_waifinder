import _ from "lamb";

/* check */

// prototype
export const startsWith = _.generic(String.prototype.startsWith);

/* edit */

export const prepend = pre => string => pre + string;
export const trim = _.generic(String.prototype.trim);

// splitting

const split = _.generic(String.prototype.split);

export const splitByEOL = _.partial(split, [_, "\n"]);

export const makeRows = _.pipe(
    splitByEOL,
    _.tail
);

/* any type to string */

export const stringify = item => `${JSON.stringify(item, null, 2)}`
