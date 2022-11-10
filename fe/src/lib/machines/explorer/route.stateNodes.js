import editingStateNodes from './editing.stateNodes.js';
import historyStateNodes from './history.stateNodes.js';

export default {
	id: 'MapRoute',
	initial: 'UnknownPlatform',
	states: {
		UnknownPlatform: {
			on: {
				CLIENT_DETECTED: {
					target: 'PageLanding'
				}
			}
		},
		PageLanding: {
			invoke: {
				id: 'FetchingData',
				src: 'loadData',
				onDone: {
					target: '#MapRoute.PageInteractive',
					actions: [
						/* 'updateDataset', */
						'mergeDefaultsAndParams',
						'updateEditingStores'
					]
				},
				onError: {
					"target": "#MapRoute.PageError"
				}
			}
		},
		PageError: {
			// TODO
		},
		PageInteractive: {
			on: {
				ROUTE_CHANGED: {
					target: '#MapRoute.PageInteractive',
					actions: [
						'mergeDefaultsAndParams',
						'updateEditingStores'
					]
				}
			},
			states: {
				Editing: editingStateNodes,
				History: historyStateNodes,
			},
			type: 'parallel'
		}
	}
};
