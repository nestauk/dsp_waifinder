/**
* @module @svizzle/utils/obj-string
*/

/**
 * Stringifies a Javascript object, including member functions.
 * @param {*} obj The object to stringify.
 */
export function stringifyObj (obj, dummy) {
	let placeholder = '____PLACEHOLDER____';
	let fns = [];
	let json = JSON.stringify(obj, function (key, value) {
		if (typeof value === 'function') {
			fns.push(dummy || value);
			return placeholder;
		}
		return value;
	}, 2);
	json = json.replace(new RegExp(`"${placeholder}"`, 'ug'), function () {
		return fns.shift();
	});
	return json;
}
