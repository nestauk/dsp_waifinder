import * as _ from 'lamb';
import rison from 'rison';
import {assign} from 'xstate/lib/actions';
import {
	// _bbox_WS_EN,
	_placesSearchValue,
	_orgSearchValue,
	_orgTypesSelectionMode,
	_selectedOrgTypes
} from 'app/stores/selection';
import {defaults} from 'app/stores/dataset';

const getQuery = () => {
	const urlParams = new URL(document.location.toString()).searchParams;
	const params = _.fromPairs(Array.from(urlParams.entries()));
	const query = params.q && rison.decode(params.q);
	return query;
};

export default {
	mergeDefaultsAndParams: assign(() => ({
		...defaults,
		...getQuery()
	})),
	updateEditingStores: ({
		// bbox_WS_EN,
		placesSearchValue,
		orgSearchValue,
		orgTypesSelectionMode,
		selectedOrgTypes
	}) => {
		console.log('set invoked')
		// _bbox_WS_EN.set(bbox_WS_EN);
		_placesSearchValue.set(placesSearchValue);
		_orgSearchValue.set(orgSearchValue);
		_orgTypesSelectionMode.set(orgTypesSelectionMode);
		_selectedOrgTypes.set(selectedOrgTypes);
		console.log('set returned')
	}
}
