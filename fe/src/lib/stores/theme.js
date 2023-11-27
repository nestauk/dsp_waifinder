import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';
import {_isA11yDirty} from '@svizzle/ui';

import {_dataset} from '$lib/stores/dataset.js';
import {makeSegmentToCssVar} from '$lib/utils/theme.js';

export const _isThemeEditorActive = writable(false);

const prefersDarkTheme =
	// eslint-disable-next-line no-undef
	globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches;

export const _themeName = writable(
	prefersDarkTheme ? 'themeDark' : 'themeLight'
);

export const toggleTheme = () => {
	_themeName.update(
		themeName => themeName === 'themeLight' ? 'themeDark' : 'themeLight'
	)
}

export const _themeVars = writable({});

export const _themeNames = derived(
	_themeVars,
	_.pipe([
		_.keys,
		_.mapWith(
			_.invoke('replace', ['.', ''])
		)
	])
);

export const _currThemeVars = derived(
	[_themeName, _themeVars],
	([themeName, themeVars]) => themeVars?.[`.${themeName}`] || {}
);

export const _barchartsTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundOpacity: 1,
		itemBackgroundColorHover: currThemeVars['--colorBarchartHoveredItemBackground'],
		itemBackgroundColorSelected: currThemeVars['--colorBarchartSelectedItemBackground'],
		itemBarColorDefault: currThemeVars['--colorBarchartItemBar'],
		itemBarColorHover: currThemeVars['--colorBarchartHoveredItemBar'],
		itemTextColorDefault: currThemeVars['--colorBarchartItemBar'],
		itemTextColorHover: currThemeVars['--colorBarchartHoveredItemText'],
		itemTextColorSelected: currThemeVars['--colorBarchartSelectedItemText'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
		textColor: currThemeVars['--colorText'],
	})
);

export const _bannersTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		border: currThemeVars['--borderAux'],
		colorBackdropSensor: currThemeVars['--colorBackdropSensor'],
		colorBackground: currThemeVars['--colorBackground'],
		colorBoxShadow: currThemeVars['--colorShadow'],
		colorText: currThemeVars['--colorText'],
	})
);

export const _getIconColor = derived(
	_currThemeVars,
	currThemeVars => makeSegmentToCssVar(
		currThemeVars,
		'--colorIconSelected',
		'--colorIcon'
	)
);

export const _getNavLinkColor = derived(
	_currThemeVars,
	currThemeVars => makeSegmentToCssVar(
		currThemeVars,
		'--colorNavLinkActive',
		'--colorNavLink'
	)
);

/* pills */

export const _pillTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorPillBackground'],
		border: currThemeVars['--border'],
		textColor: currThemeVars['--colorPillText'],
	})
);


/* links */

export const _linkTheme0 = derived(
	_currThemeVars,
	currThemeVars => ({
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _linkTheme1 = derived(
	_currThemeVars,
	currThemeVars => ({
		color: currThemeVars['--colorLink'],
		iconStroke: currThemeVars['--colorLink'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _linkTheme2 = derived(
	_currThemeVars,
	currThemeVars => ({
		color: currThemeVars['--colorIcon'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _extLinkTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		color: currThemeVars['--colorNavLink'],
		iconStroke: currThemeVars['--colorIcon'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

/* a11y menu & icon */

export const _a11yMenuTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		colorBackground: currThemeVars['--colorBackground'],
		colorBorder: currThemeVars['--colorBorderAux'],
		colorKnob: currThemeVars['--colorSwitchKnob'],
		colorDisabled: currThemeVars['--colorTextDisabled'],
		colorText: currThemeVars['--colorText']
	})
);
export const _a11yIconFillColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorIcon']
		: currThemeVars['--colorBackground']
);
export const _a11yIconStrokeColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorBackground']
		: currThemeVars['--colorIcon']
);

/* org types */

export const _orgTypeToColorFn = derived(
	[_currThemeVars, _dataset],
	([currThemeVars, {orgTypeIndexByType}]) =>
		orgType => {
			const classIndex = orgTypeIndexByType[orgType];

			return currThemeVars[`--colorOrgtype${classIndex}`];
		}
);

export const _orgTypeToTextColorFn = derived(
	[_currThemeVars, _dataset],
	([currThemeVars, {orgTypeIndexByType}]) =>
		orgType => {
			const classIndex = orgTypeIndexByType[orgType];

			return currThemeVars[`--colorOrgtype${classIndex}Text`];
		}
);

/* scrollbars */

export const _scrollbarTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		thumbColor: currThemeVars['--colorScrollbarThumb'],
		trackBorderColor: currThemeVars['--colorScrollbarTrackBorder'],
		trackColor: currThemeVars['--colorScrollbarTrack'],
		// TBD, include `thumbRadius` & `trackWidth`?
	})
);
