import {derived, writable, get} from 'svelte/store';

import {_dataset} from '$lib/stores/dataset';
import {_isOrgWithinBbox} from '$lib/stores/selection';
/* hero */

export const _hero = writable(null);

export const clearHero = () => {
	_hero.set(null);
}

export const setHero = ({id, isPinned, isVisible}) => {
	let hero;
	const {orgsById} = get(_dataset);
	const org = orgsById[id];
	if (org) {
		hero = {
			isVisible,
			isPinned,
			org
		};
	}
	_hero.set(hero);
};

export const clearInteractionStores = () => {
	_hero.update(hero => hero?.isPinned ? hero : null);
}

export const _isHeroInBounds = derived(
	[_hero, _isOrgWithinBbox],
	([hero, isOrgWithinBbox]) => Boolean(hero)
		&& isOrgWithinBbox(hero.org)
);

/* map */

export const _isCursorOnMap = writable(false);

export const setIsCursorOnMap = () => _isCursorOnMap.set(true);
export const clearIsCursorOnMap = () => _isCursorOnMap.set(false);

export const _isZoomBannerVisible = writable(false);
