import {_screen} from '@svizzle/ui';
import {derived} from 'svelte/store';

/* responsive */

export const _screenId = derived(
	_screen,
	s => s && s.sizes.medium ? 'medium': 'small'
);

export const _isSmallScreen = derived(
	_screen,
	s => s && (s.sizes.small && !s.sizes.medium)
);
export const _screenClasses = derived(_screen, s => s?.classes);
