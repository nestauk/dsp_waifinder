import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';
import {_isA11yDirty} from '@svizzle/ui/src/a11y/menu/settings';

import {_dataset} from 'app/stores/dataset';

export const _isThemeEditorActive = writable(false);

export const _themeName = writable('theme');
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

export const _a11yStrokeColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorBackgroundMain']
		: currThemeVars['--colorMain']
);

export const _a11yFillColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorMain'] : ''
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
