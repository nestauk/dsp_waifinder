export const getColorIfEqual = (
	reference,
	actual,
	themeVars,
	varEqual,
	varNot
) => reference === actual
	? themeVars[varEqual]
	: themeVars[varNot];

export const makeGetColorIfEqual = (themeVars, varEqual, varNotEqual) =>
	(reference, actual) => getColorIfEqual(
		reference,
		actual,
		themeVars,
		varEqual,
		varNotEqual,
	);
