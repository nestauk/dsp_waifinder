import _ from "lamb";

import * as d3 from "@vendor/d3";

import {makeFloatsValues} from "./objUtils";

import {joinWithColon, joinWithSemicolon} from "./arrayUtils";

/* get from DOM */

export const getElementGeometry = (elem, additionalProps = []) =>
    makeFloatsValues(
        _.pick(getComputedStyle(elem), [
            "width",
            "height",
            ...additionalProps
        ])
    );

/* edit DOM */

export const moveNode = (node, newContainer) =>
    d3.select(newContainer).append(
        () => d3.select(node).remove().node()
    );

/* make attrs */

// obj => style string
export const makeStyle = _.pipe(
    _.pairs,
    _.mapWith(joinWithColon),
    joinWithSemicolon
);

export const toPx = number => `${number}px`;
