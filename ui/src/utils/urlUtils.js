import _ from "lamb";

import {prepend, startsWith} from "./stringUtils";

export const sanitizeURLProtocol = _.condition(
    _.partial(startsWith, [_, "http"]),
    _.identity,
    prepend("http://")
);
