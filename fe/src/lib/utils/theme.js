export const makeSegmentToCssVar =
	(themeVars, activeSegmentCssVar, inactiveSegmentCssVar) =>
		(segment, string) =>
			segment === string
				? themeVars[activeSegmentCssVar]
				: themeVars[inactiveSegmentCssVar];
