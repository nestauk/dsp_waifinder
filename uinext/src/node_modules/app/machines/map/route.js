import { createMachina } from '../utils';

import editingActions from 'app/machines/map/editing.actions';
import historyActions from './history.actions';
// import historyGuards from './history.guards';
import routeStateNodes from 'app/machines/map/route.stateNodes';
import routeActions from 'app/machines/map/route.actions';
import routeServices from 'app/machines/map/route.services';
import { createEditingStores } from 'app/machines/map/editing.context';

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
