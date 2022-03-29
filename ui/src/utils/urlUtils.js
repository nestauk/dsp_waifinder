import _ from "lamb";

import {prepend, startsWith} from "./stringUtils";

export const sanitizeURLProtocol = _.condition(
	_.partial(startsWith, [_, "http"]),
	_.identity,
	prepend("http://")
);

/*
name: 'Cambridge Display Technology Limited'
=>
query: `"Cambridge Display Technology Limited" region:UK`
=>
URL: https://duckduckgo.com/?q=%22Cambridge+Display+Technology+Limited%22+region:UK

name: `Guy's & St Thomas' NHS Foundation Trust`
URL: https://duckduckgo.com/?q=%22Guy's+%26+St+Thomas'+NHS+Foundation+Trust%22+region:UK
*/
export const makeSearchEngineURL = name => {
	const queryName = name.split(/\s+/gu).map(encodeURIComponent).join('+');

	const url = `https://duckduckgo.com/?q=%22${queryName}%22+region:UK`;

	return url;
}
