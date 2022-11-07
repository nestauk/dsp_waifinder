import { createMachina } from '../utils';

import editingActions from '$lib/machines/explorer/editing.actions';
import historyActions from './history.actions';
// import historyGuards from './history.guards';
import routeStateNodes from '$lib/machines/explorer/route.stateNodes';
import routeActions from '$lib/machines/explorer/route.actions';
import routeServices from '$lib/machines/explorer/route.services';
import { createEditingStores } from '$lib/machines/explorer/editing.context';

export const createMapMachine = () => createMachina({
	actions: {
		...editingActions,
		...historyActions,
		...routeActions
	},
	contextStores: createEditingStores(),
	/*
	guards: {
		...historyGuards
	}
	*/
	stateNodes: routeStateNodes,
	services: routeServices
});
