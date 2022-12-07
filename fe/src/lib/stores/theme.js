import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';
import {_isA11yDirty} from '@svizzle/ui';

import {_dataset} from '$lib/stores/dataset';
import {makeSegmentToCssVar} from '$lib/utils/theme';

export const _isThemeEditorActive = writable(false);

const prefersDarkTheme =
	// eslint-disable-next-line no-undef
	globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches;

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
		barDefaultColor: currThemeVars['--colorBarchartItemBar'],
		deselectedOpacity: 1,
		focusOutline: currThemeVars['--outline'],
		hoverColor: currThemeVars['--colorBarchartHoveredItemBackground'],
		hoverColorBar: currThemeVars['--colorBarchartHoveredItemBar'],
		hoverColorText: currThemeVars['--colorBarchartHoveredItemText'],
		selectedKeyBackgroundColor: currThemeVars['--colorBarchartSelectedItemBackground'],
		selectedKeyTextColor: currThemeVars['--colorBarchartSelectedItemText'],
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

export const _a11yStrokeColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorBackground']
		: currThemeVars['--colorIcon']
);

export const _a11yFillColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorIcon']
		: currThemeVars['--colorBackground']
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
